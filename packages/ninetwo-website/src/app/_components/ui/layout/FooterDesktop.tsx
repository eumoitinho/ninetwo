'use client';

import styled from '@emotion/styled';

import {
    GithubIcon2,
    LinkedInIcon,
    XIcon
} from '../icons/SvgIcons';

import { Logo } from './Logo';

const FooterContainer = styled.div`
  padding: 64px 96px 64px 96px;
  display: flex;
  flex-direction: column;
  color: rgb(129, 129, 129);
  gap: 32px;
  @media (max-width: 809px) {
    padding: 36px 24px;
  }
`;

const LeftSideFooter = styled.div`
  width: 36Opx;
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (max-width: 809px) {
    display: none;
  }
`;

const RightSideFooter = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 48px;
  height: 146px;
  @media (max-width: 809px) {
    flex-direction: column;
    height: fit-content;
  }
`;

const RightSideFooterColumn = styled.div`
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RightSideFooterLink = styled.a`
  color: rgb(129, 129, 129);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
    color: #000;
  }
`;

const RightSideFooterColumnTitle = styled.div`
  font-size: 20px;
  font-weight: 500;
  color: #000;
`;

export const FooterDesktop = () => {
  return (
    <FooterContainer>
      <div
        style={{
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <LeftSideFooter>
          <Logo />
          <div>Marketing de Performance - Uma empresa Catalisti Holding</div>
        </LeftSideFooter>
        <RightSideFooter>
          <RightSideFooterColumn>
            <RightSideFooterColumnTitle>Empresa</RightSideFooterColumnTitle>
            <RightSideFooterLink href="/sobre">Sobre Nós</RightSideFooterLink>
            <RightSideFooterLink href="/cases">Cases</RightSideFooterLink>
          </RightSideFooterColumn>
          <RightSideFooterColumn>
            <RightSideFooterColumnTitle>Soluções</RightSideFooterColumnTitle>
            <RightSideFooterLink href="/solucoes/marketing-performance">
              Marketing de Performance
            </RightSideFooterLink>
            <RightSideFooterLink href="/solucoes/bi-marketing">
              B.I de Marketing
            </RightSideFooterLink>
            <RightSideFooterLink href="/solucoes/mensuracao">Mensuração</RightSideFooterLink>
          </RightSideFooterColumn>
          <RightSideFooterColumn>
            <RightSideFooterColumnTitle>Contato</RightSideFooterColumnTitle>
            <RightSideFooterLink href="mailto:contato@ninetwo.com.br">
              contato@ninetwo.com.br
            </RightSideFooterLink>
            <RightSideFooterLink href="tel:+5541991425126">
              (41) 99142-5126
            </RightSideFooterLink>
            <RightSideFooterLink href="/legal/termos">
              Termos de Serviço
            </RightSideFooterLink>
            <RightSideFooterLink href="/legal/privacidade">
              Política de Privacidade
            </RightSideFooterLink>
          </RightSideFooterColumn>
        </RightSideFooter>
      </div>
      <div
        style={{
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderTop: '1px solid rgb(179, 179, 179)',
          paddingTop: '32px',
        }}
      >
        <div>
          <span style={{ fontFamily: 'Inter, sans-serif' }}>©</span>
          {new Date().getFullYear()} Catalisti - Marketing de Performance
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <a
            href="https://www.linkedin.com/company/ninetwo-performance"
            target="_blank"
            rel="noreferrer"
          >
            <LinkedInIcon size="M" />
          </a>
          <a
            href="https://instagram.com/ninetwo.performance"
            target="_blank"
            rel="noreferrer"
          >
            <XIcon size="M" />
          </a>
          <a
            href="https://facebook.com/ninetwo.performance"
            target="_blank"
            rel="noreferrer"
          >
            <GithubIcon2 size="M" />
          </a>
        </div>
      </div>
    </FooterContainer>
  );
};
