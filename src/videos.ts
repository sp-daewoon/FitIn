import { t } from './i18n';
import { MachineId, machines } from './workout';

// Publisher pages checked 2026-09-12; playback and technique review remain unverified.
export const exerciseVideos: Partial<
  Record<MachineId, { url: string; title: string; source: string }>
> = {
  chestPress: {
    url: 'https://youtube.com/shorts/R0kDmBrxioo',
    get title() {
      return t('체스트 프레스 · 원판형 머신');
    },
    get source() {
      return t('Deb C Fitness · 영어');
    },
  },
  legPress: {
    url: 'https://youtube.com/shorts/Mru4PknAUc8',
    get title() {
      return t('레그 프레스 · 원판형 머신');
    },
    get source() {
      return t('Deb C Fitness · 영어');
    },
  },
  latPulldown: {
    url: 'https://youtube.com/shorts/PO2WCE7_ur4',
    get title() {
      return t('랫 풀다운 · 케이블 머신');
    },
    get source() {
      return t('Deb C Fitness · 영어');
    },
  },
  legExtension: {
    url: 'https://youtube.com/shorts/pDWSBKeYd2c',
    get title() {
      return t('레그 익스텐션');
    },
    get source() {
      return t('Deb C Fitness · 영어');
    },
  },
  legCurl: {
    url: 'https://youtu.be/imRvlBe6xU8',
    get title() {
      return t('시티드 레그 컬 · 일반 영상');
    },
    get source() {
      return t('Deb C Fitness · 영어');
    },
  },
  dumbbellRow: {
    url: 'https://youtube.com/shorts/brqbLM2wiPs',
    get title() {
      return t('덤벨 로우');
    },
    get source() {
      return t('My Time Fitness · 영어');
    },
  },
};
export function videoSearch(machine: MachineId) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(t('{0} 자세 사용법 shorts', machines[machine].name))}`;
}
