import {
  CallToActionContainer,
  LinkNextToCTA,
  StyledButton,
} from '@/app/_components/ui/layout/header/styled';

export const CallToAction = () => {
  return (
    <CallToActionContainer>
      <LinkNextToCTA href="/contato">Contato</LinkNextToCTA>
      <a href="/contato">
        <StyledButton>Falar com Especialista</StyledButton>
      </a>
    </CallToActionContainer>
  );
};
