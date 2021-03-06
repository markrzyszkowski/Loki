import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import * as PropTypes from 'prop-types';
import { ellipsis } from '../../util';

function Ellipsis(props) {
    const {text, maxLength, interactive} = props;

    return (
        <>
            {text.length <= maxLength && <div>{text}</div>}
            {text.length > maxLength &&
             <Tooltip title={text} interactive={interactive}>
                 <div>{ellipsis(text, maxLength)}</div>
             </Tooltip>}
        </>
    );
}

Ellipsis.propTypes = {
    text: PropTypes.string.isRequired,
    maxLength: PropTypes.number.isRequired,
    interactive: PropTypes.bool.isRequired
};

export default Ellipsis;
