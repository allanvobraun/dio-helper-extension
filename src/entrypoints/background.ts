import { syncBadge } from '../lib/badge';
import { showSubtitles } from '../lib/settings';

export default defineBackground(() => {
  void showSubtitles.getValue().then(syncBadge);
  showSubtitles.watch((shown) => syncBadge(shown));
});
