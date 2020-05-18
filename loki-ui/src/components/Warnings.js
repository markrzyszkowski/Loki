import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import { Error } from '@material-ui/icons';
import * as PropTypes from 'prop-types';
import WarningsItem from './WarningsItem';
import { flection } from '../util';
import { warningCount } from '../warning';

function Warnings(props) {
    const {project, projectState, index, onModifyProjectState} = props;

    const [showDialog, setShowDialog] = useState(false);

    const handleOpenDialog = () => {
        setShowDialog(true);
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
    };

    const handleNavigateToWarning = (tab, field) => {
        const tabIndex = project.tabs.findIndex(t => t.id === tab);

        setShowDialog(false);

        if (tabIndex !== projectState.activeTab) {
            onModifyProjectState(index, {activeTab: tabIndex});
        }
    };

    const count = warningCount(projectState.warnings);

    return (
        <>
            <Chip
                icon={<Error/>}
                label={flection(count, 'warning', 'warnings')}
                onClick={handleOpenDialog}
            />
            <Dialog open={showDialog} scroll="paper" onClose={handleCloseDialog}>
                <DialogTitle>{`Warnings for ${project.name}`}</DialogTitle>
                <DialogContent>
                    <List>
                        {Object.entries(projectState.warnings)
                               .flatMap(([tab, warnings]) => Object.entries(warnings).map(([field, warning]) =>
                                   <WarningsItem
                                       name={project.tabs.find(t => t.id === tab).name}
                                       tab={tab}
                                       field={field}
                                       warning={warning}
                                       onNavigateToWarning={handleNavigateToWarning}
                                   />
                               ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

Warnings.propTypes = {
    project: PropTypes.object.isRequired,
    projectState: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    onModifyProjectState: PropTypes.func.isRequired
};

export default Warnings;