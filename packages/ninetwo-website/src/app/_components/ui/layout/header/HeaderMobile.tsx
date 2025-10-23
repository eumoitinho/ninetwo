'use client';

import { IBM_Plex_Mono } from 'next/font/google';
import { useState } from 'react';

import { CallToAction } from '@/app/_components/ui/layout/header/callToAction';
import {
    HamburgerContainer,
    HamburgerLine1,
    HamburgerLine2,
    ListItem,
    LogoAddon,
    LogoContainer,
    MobileLinkList,
    MobileMenu,
    MobileNav,
    NavOpen,
} from '@/app/_components/ui/layout/header/styled';
import { Logo } from '@/app/_components/ui/layout/Logo';

const IBMPlexMono = IBM_Plex_Mono({
  weight: '500',
  subsets: ['latin'],
  display: 'swap',
});

type Props = {
  numberOfStars: number;
};

export const HeaderMobile = ({ numberOfStars }: Props) => {
  const isTwentyDev = false;

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <MobileMenu>
      <MobileNav>
        <LogoContainer>
          <Logo />
          {isTwentyDev && (
            <LogoAddon className={IBMPlexMono.className}>
              for Developers
            </LogoAddon>
          )}
        </LogoContainer>
        <HamburgerContainer>
          <input type="checkbox" id="menu-input" onChange={toggleMenu} />
          <HamburgerLine1 id="line1" />
          <HamburgerLine2 id="line2" />
        </HamburgerContainer>
      </MobileNav>
      <NavOpen
        style={{
          transform: `scaleY(${menuOpen ? '1' : '0'})`,
        }}
      >
        <MobileLinkList>
          <ListItem href="/sobre">Sobre</ListItem>
          <ListItem href="/solucoes">Soluções</ListItem>
          <ListItem href="/cases">Cases</ListItem>
          <ListItem href="/contato">Contato</ListItem>
        </MobileLinkList>
        <CallToAction />
      </NavOpen>
    </MobileMenu>
  );
};
