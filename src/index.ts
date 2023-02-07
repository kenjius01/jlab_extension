import { showExecutionDialog } from './executor';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IExecutor } from './command';

const isExecutableScript = (widget: any): boolean => {
  return widget && Array(widget.selectedItems()).length === 1;
};

const COMMAND_ID = 'jupyterlab-executor:execute';
/**
 * Initialization data for the executor_jlab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'executor_jlab:plugin',
  autoStart: true,
  requires: [IFileBrowserFactory, ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    factory: IFileBrowserFactory,
    settingRegistry: ISettingRegistry
  ) => {
    console.log('JupyterLab extension executor_jlab is activated!');

    const { tracker } = factory;
    let executors: IExecutor[] = [];
    const updateSettings = (settings: ISettingRegistry.ISettings): void => {
      executors = settings?.composite.executors as IExecutor[];
    };

    Promise.all([
      settingRegistry?.load('executor_jlab:plugin'),
      app.restored
    ]).then(([settings]) => {
      updateSettings(settings);
      settings?.changed.connect(updateSettings);
    });

    app.commands.addCommand(COMMAND_ID, {
      execute: () => {
        const widget = tracker.currentWidget;
        if (!widget) {
          return;
        }

        // Show the execution dialog
        const path = widget?.selectedItems()?.next()?.path;
        showExecutionDialog(app, path ?? '', executors);
      },
      isVisible: () => isExecutableScript(tracker.currentWidget),
      iconClass: 'jp-RunIcon',
      label: 'Execute'
    });

    app.contextMenu.addItem({
      command: COMMAND_ID,
      selector: '.jp-DirListing-item'
    });
  }
};

export default plugin;
