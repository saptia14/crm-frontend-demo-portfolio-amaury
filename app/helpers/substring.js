import { helper } from '@ember/component/helper';

export default helper(function substring([string, start, end] /*, hash*/) {
  if (!string) return '';
  return string.substring(start, end);
});
