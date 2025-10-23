// import { desc } from 'drizzle-orm';

import { HeaderDesktop } from '@/app/_components/ui/layout/header/HeaderDesktop';
import { HeaderMobile } from '@/app/_components/ui/layout/header/HeaderMobile';
// import { findOne } from '@/database/database';
// import { githubStarsModel } from '@/database/model';

export const AppHeader = async () => {
  // const githubStars = await findOne(
  //   githubStarsModel,
  //   desc(githubStarsModel.timestamp),
  // );

  // Temporariamente sem banco de dados
  const numberOfStars = 0;

  return (
    <>
      <HeaderDesktop numberOfStars={numberOfStars} />
      <HeaderMobile numberOfStars={numberOfStars} />
    </>
  );
};
