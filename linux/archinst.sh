#!/bin/bash
# archinst.sh version 1.2.0
# Simple Arch Linux install guide, not sopport LUKS, LVM & RAID!
# Copyright (C) 2022 Joseph Chris MIT License

install_default="base linux linux-firmware vim openssh"
echo "Make sure you have connected to Internet, and mounted everything to /mnt"
read -p "Is there any other things to install, other than $install_default? " install
install="$install_default $install"

echo "Ok, we will install: $install"
read -p "What timezone are you using? [UTC] " timezone
if [ ! -f "/mnt/usr/share/zoneinfo/$timezone" ]; then
	echo "I can not find the timezone. Set to UTC."
	timezone=UTC
fi
echo "Locale: we will set en_US.UTF-8 as default. You can change it later after system installation."

read -p "What is your hostname? [archlinux] " sethostname
if [ -z $sethostname ]; then
	sethostname=archlinux
fi

github=""
read -p "Do you want to import SSH key from GitHub? [GitHub Username/leave it blank] " github
if [ ! -z $github ]; then
	echo "Added install openssh."
	install="$install openssh"
fi

if [ ! -d /sys/firmware/efi/efivars ]; then
	bootmode=bios
else
	bootmode=uefi
fi

read -p "Do you want to set root password later? [y/n] " set_root_password
if [ $set_root_password = "y" ]; then
	set_root_password=Yes
else
	set_root_password=No
fi

mbresp="(none)"
read -p "Install GRUB? [y/n] " grub
if [ $grub = "y" ]; then
	grub=Yes
	if [ $bootmode = "bios" ]; then
		read -p "Which disk to install MBR? [/dev/sda] " mbresp
		if [ -z $mbresp ]; then
			mbresp=/dev/sda
		fi
		echo "Install MBR to $mbresp"
	else
		read -p "Which dir to install GRUB EFI? [/efi] " mbresp
		if [ -z $mbresp ]; then
                        mbresp=/efi
                fi
                echo "Install GRUB EFI to $mbresp"
	fi
else
	grub=No
fi

# confirm
pkgarray=($install)
echo "========================================================="
echo "                 Installation Summary                    "
echo "========================================================="
echo "  Timezone:          $timezone"
echo "  Locale:            en_US.UTF-8"
echo "  Hostname:          $sethostname"
echo "  Boot Type:         $bootmode"
echo "  Set Password:      $set_root_password"
echo "  GitHub SSH Key:    $github"
echo "  Install GRUB:      $grub"
echo "  MBR/ESP:           $mbresp"
echo "  Packages:          [See Below]"
for pkg in "${pkgarray[@]}"; do
echo "                     $pkg                                "
done
echo "========================================================="
read -p "Is that right? [y/n] " confirm
if [ $confirm != "y" ]; then
	echo "Abort"
	exit 2
fi

# start installation
echo "Setting up time..."
timedatectl set-ntp true
timedatectl status
echo "Installing base system..."
echo "pacstrap /mnt base linux linux-firmware $install"
pacstrap /mnt base linux linux-firmware $install
echo "Generating fstab..."
genfstab -U /mnt >> /mnt/etc/fstab
echo "Setting up timezone..."
arch-chroot /mnt ln -sf /usr/share/zoneinfo/$timezone /etc/localtime
arch-chroot /mnt hwclock --systohc
echo "Setting up locale..."
cp /mnt/etc/locale.gen /mnt/etc/locale.gen.available
echo "en_US.UTF-8 UTF-8" > /mnt/etc/locale.gen
echo "LANG=en_US.UTF-8"  > /mnt/etc/locale.conf
arch-chroot /mnt locale-gen
echo "Setting up hostname..."
echo "$sethostname" >  /mnt/etc/hostname
echo "127.0.0.1	localhost"         >> /mnt/etc/hosts
echo "::1		localhost" >> /mnt/etc/hosts
echo "127.0.0.1	$sethostname"      >> /mnt/etc/hosts
if [ ! -z $github ]; then
	echo "Installing SSH Keys of GitHub user $github..."
	mkdir -p /mnt/root/.ssh
	curl https://github.com/$github.keys -o /mnt/root/.ssh/authorized_keys
	chmod 600 /mnt/root/.ssh/authorized_keys
	arch-chroot /mnt systemctl enable sshd
	echo "SSH Key:"
	cat /mnt/root/.ssh/authorized_keys
fi

cat > /mnt/etc/systemd/network/default-dhcp.network <<EOF
[Match]
Name=enp1s0

[Network]
DHCP=ipv4
EOF
arch-chroot /mnt systemctl enable systemd-networkd
echo "nameserver 1.1.1.1" >> /mnt/etc/resolv.conf
arch-chroot /mnt ln -sf /usr/bin/vim /usr/bin/vi

if [ $set_root_password = "Yes" ]; then
	echo "Please set root password."
	arch-chroot /mnt passwd
fi

if [ $grub = "Yes" ]; then
	echo "Installing GRUB... You have 5 seconds to press Ctrl-C to abrot."
	sleep 5
	if [ $bootmode = "uefi" ]; then
		arch-chroot /mnt pacman -Syy grub efibootmgr
		echo "Install GURB x86_64-efi to $mbresp..."
		arch-chroot /mnt grub-install --target=x86_64-efi --efi-directory=$mbresp --bootloader-id=GRUB
	else
		arch-chroot /mnt pacman -Syy grub
		echo "Install GRUB i386-pc to $mbresp..."
		arch-chroot /mnt grub-install --target=i386-pc $mbresp
	fi
	echo "Generating GRUB configuration..."
	arch-chroot /mnt grub-mkconfig -o /boot/grub/grub.cfg
fi

# print notes
echo "Done! Welcome to be an Archman!"
echo "Content of fstab:"
cat /mnt/etc/fstab
cat << EOF
***********          IMPORTANT NOTE           **********
1. /mnt/etc/fstab is print above. Please check it before
   you restart.
2. If you are using RAID, LVM or LUKS, please edit:
       /mnt/etc/mkinitcpio.conf    IN CHROOT
   and run IN CHROOT:
       mkinitcpio -P
3. You can update microcodes, by: (IN CHROOT)
       pacman -Syy amd-ucode
       pacman -Syy intel-ucode
   I have never see problems without this, but if you
   have problems you should install it manually.
********************************************************
        THESE STEPS WILL NOT DONE AUTOMATICALLY    
EOF
