import React from 'react';
import ConfigurationPanel from './config/ConfigurationPanel';

interface ConfigEditorProps {
    isDisabled: boolean;
}

const ConfigEditor: React.FC<ConfigEditorProps> = ({ isDisabled }) => {
    return <ConfigurationPanel isDisabled={isDisabled} />;
};

export default ConfigEditor;