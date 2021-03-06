import React from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import { Delete } from '@material-ui/icons';
import * as PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    field: {
        flexGrow: 1,
        margin: theme.spacing(1)
    },
    button: {
        alignSelf: 'start',
        marginTop: theme.spacing(0.5),
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    }
}));

function ResponseHeader(props) {
    const {header, index, ruleId, warnings, onDeleteHeader, onKeyChange, onValueChange} = props;

    const classes = useStyles();

    const handleDeleteHeader = () => {
        onDeleteHeader(index);
    };

    const handleKeyChange = event => {
        const key = event.target.value.trim();

        if (key !== header.key) {
            onKeyChange(index, key);
        }
    };

    const handleValueChange = event => {
        const value = event.target.value.trim();

        if (value !== header.value) {
            onValueChange(index, value);
        }
    };

    return (
        <FormGroup row>
            <TextField
                error={!!warnings[`${ruleId}-response-header-${index}-key`]}
                helperText={warnings[`${ruleId}-response-header-${index}-key`]}
                variant="outlined"
                size="small"
                label="Key"
                value={header.key}
                onChange={handleKeyChange}
                className={classes.field}
            />
            <TextField
                error={!!warnings[`${ruleId}-response-header-${index}-value`]}
                helperText={warnings[`${ruleId}-response-header-${index}-value`]}
                variant="outlined"
                size="small"
                label="Value"
                value={header.value}
                onChange={handleValueChange}
                className={classes.field}
            />
            <IconButton onClick={handleDeleteHeader} className={classes.button}>
                <Delete/>
            </IconButton>
        </FormGroup>
    );
}

ResponseHeader.propTypes = {
    header: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    ruleId: PropTypes.string.isRequired,
    warnings: PropTypes.object.isRequired,
    onDeleteHeader: PropTypes.func.isRequired,
    onKeyChange: PropTypes.func.isRequired,
    onValueChange: PropTypes.func.isRequired
};

export default ResponseHeader;
