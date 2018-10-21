import { ConfusionMatrixCtrl } from './cm_ctrl';
import { loadPluginCss } from 'app/plugins/sdk';

loadPluginCss({
  dark: 'plugins/confusion-matrix-panel/css/piechart.dark.css',
  light: 'plugins/confusion-matrix-panel/css/piechart.light.css',
});

export { ConfusionMatrixCtrl as PanelCtrl };
