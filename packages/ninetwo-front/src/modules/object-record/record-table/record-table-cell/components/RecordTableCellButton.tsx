import styled from '@emotion/styled';
import { AnimatedContainer } from 'ninetwo-ui/utilities';
import { FloatingIconButton } from 'ninetwo-ui/input';
import { type IconComponent } from 'ninetwo-ui/display';
import { MOBILE_VIEWPORT } from 'ninetwo-ui/theme';

const StyledButtonContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(1)};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    position: relative;
    right: 7px;
  }
`;

type RecordTableCellButtonProps = {
  onClick?: () => void;
  Icon: IconComponent;
};

export const RecordTableCellButton = ({
  onClick,
  Icon,
}: RecordTableCellButtonProps) => (
  <AnimatedContainer>
    <StyledButtonContainer>
      <FloatingIconButton size="small" onClick={onClick} Icon={Icon} />
    </StyledButtonContainer>
  </AnimatedContainer>
);
