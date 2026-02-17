import { useControls, button, folder } from 'leva';
import { exportProject } from './exportProject';
import { travels } from '../utilities/travels';

const ExportPanel = ({ config, headingLine1, headingLine2 }) => {
  useControls({
    'Export Project': folder({
      'Download ZIP': button(() => {
        const heading = [headingLine1, headingLine2].filter(Boolean).join('\n');
        exportProject(config, heading, travels);
      }),
    }, { collapsed: true }),
  });

  return null;
};

export default ExportPanel;
