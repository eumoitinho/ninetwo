import styled from '@emotion/styled';
import { Card } from 'ninetwo-ui/layout';

const StyledCard = styled(Card)`
  background-color: ${({ theme }) => theme.background.secondary};
  height: 40px;
`;

export { StyledCard as SettingsListSkeletonCard };
