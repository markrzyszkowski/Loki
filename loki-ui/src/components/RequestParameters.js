import React from 'react';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Add, ExpandMore } from '@material-ui/icons';
import clsx from 'clsx';
import * as PropTypes from 'prop-types';
import RequestParameter from './RequestParameter';
import ExpansionPanelSummary from './mui/ExpansionPanelSummary';
import { defaultParameterWithConditions } from '../defaults';
import { deleteWarnings, shiftIndexedWarnings, validators } from '../warnings';

const useStyles = makeStyles(theme => ({
    parameters: {
        display: 'block',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1)
    },
    center: {
        display: 'flex',
        justifyContent: 'center'
    },
    button: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3)
    },
    buttonOffset: {
        marginTop: 5,
        marginBottom: theme.spacing(3)
    },
    warning: {
        color: 'red',
        fontWeight: 'bold'
    }
}));

function RequestParameters(props) {
    const {parameters, parametersExpanded, ruleId, warnings, onModifyRequest} = props;

    const classes = useStyles();

    const handleStateChange = (_, expanded) => {
        onModifyRequest({parametersExpanded: expanded});
    };

    const handleAddParameter = () => {
        const parameter = defaultParameterWithConditions();

        const warningsCopy = {...warnings};
        validators.parameterKey(parameter.key, ruleId, parameters.length, warningsCopy);
        validators.parameterValue(parameter.value, ruleId, parameters.length, warningsCopy);

        onModifyRequest({parameters: [...parameters, parameter]}, warningsCopy);
    };

    const handleDeleteParameter = index => {
        const parametersCopy = [...parameters];
        parametersCopy.splice(index, 1);

        let warningsCopy = {...warnings};
        deleteWarnings(`${ruleId}-request-parameter-${index}`, warningsCopy);
        warningsCopy = shiftIndexedWarnings(`${ruleId}-request-parameter`, index, warningsCopy);

        onModifyRequest({parameters: parametersCopy}, warningsCopy);
    };

    const handleParameterKeyChange = (index, key) => {
        const parametersCopy = [...parameters];
        parametersCopy[index] = {...parametersCopy[index], key: key};

        const warningsCopy = {...warnings};
        validators.parameterKey(key, ruleId, index, warningsCopy);

        onModifyRequest({parameters: parametersCopy}, warningsCopy);
    };

    const handleParameterKeyIgnoreCaseChange = (index, ignoreCase) => {
        const parametersCopy = [...parameters];
        parametersCopy[index] = {...parametersCopy[index], keyIgnoreCase: ignoreCase};

        onModifyRequest({parameters: parametersCopy});
    };

    const handleParameterValueChange = (index, value) => {
        const parametersCopy = [...parameters];
        parametersCopy[index] = {...parametersCopy[index], value: value};

        const warningsCopy = {...warnings};
        validators.parameterValue(value, ruleId, index, warningsCopy);

        onModifyRequest({parameters: parametersCopy}, warningsCopy);
    };

    const handleParameterValueIgnoreCaseChange = (index, ignoreCase) => {
        const parametersCopy = [...parameters];
        parametersCopy[index] = {...parametersCopy[index], valueIgnoreCase: ignoreCase};

        onModifyRequest({parameters: parametersCopy});
    };

    const handleParameterConditionChange = (index, condition) => {
        const parametersCopy = [...parameters];
        parametersCopy[index] = {...parametersCopy[index], condition: condition};

        const warningsCopy = {...warnings};
        if (!parameters[index].condition.includes('PRESENT') && condition.includes('PRESENT')) {
            deleteWarnings(`${ruleId}-request-parameter-${index}-value`, warningsCopy);
        } else if (parameters[index].condition.includes('PRESENT') && !condition.includes('PRESENT')) {
            validators.parameterValue(parametersCopy[index].value, ruleId, index, warningsCopy);
        }

        onModifyRequest({parameters: parametersCopy}, warningsCopy);
    };

    const hasParameters = parameters.length > 0;
    const hasWarnings = hasParameters
                        && Object.keys(warnings).filter(id => id.startsWith(`${ruleId}-request-parameter`)).length > 0;
    const headingClass = hasWarnings ? classes.warning : null;
    const shouldOffsetButton = !!warnings[`${ruleId}-request-parameter-${parameters.length - 1}-key`]
                               || !!warnings[`${ruleId}-request-parameter-${parameters.length - 1}-value`];
    const buttonClass = clsx(!shouldOffsetButton && classes.button, shouldOffsetButton && classes.buttonOffset);

    return (
        <ExpansionPanel square expanded={parametersExpanded} onChange={handleStateChange}>
            <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                <Typography className={headingClass}>Parameters</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className={classes.parameters}>
                {parameters.map((parameter, index) =>
                    <RequestParameter
                        key={index}
                        parameter={parameter}
                        index={index}
                        ruleId={ruleId}
                        warnings={warnings}
                        onDeleteParameter={handleDeleteParameter}
                        onKeyChange={handleParameterKeyChange}
                        onKeyIgnoreCaseChange={handleParameterKeyIgnoreCaseChange}
                        onValueChange={handleParameterValueChange}
                        onValueIgnoreCaseChange={handleParameterValueIgnoreCaseChange}
                        onConditionChange={handleParameterConditionChange}
                    />
                )}
                <div className={classes.center}>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<Add/>}
                        onClick={handleAddParameter}
                        className={buttonClass}
                    >
                        Add parameter
                    </Button>
                </div>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    );
}

RequestParameters.propTypes = {
    parameters: PropTypes.array.isRequired,
    parametersExpanded: PropTypes.bool.isRequired,
    ruleId: PropTypes.string.isRequired,
    warnings: PropTypes.object.isRequired,
    onModifyRequest: PropTypes.func.isRequired
};

export default RequestParameters;
