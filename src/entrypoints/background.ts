import { syncBadge } from '../lib/badge';
import { hideSubtitles } from '../lib/settings';

export default defineBackground(() => {
  void hideSubtitles.getValue().then(syncBadge);
  hideSubtitles.watch((hidden) => syncBadge(hidden));
});
