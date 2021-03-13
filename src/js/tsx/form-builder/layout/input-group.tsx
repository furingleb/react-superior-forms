import React from 'react';

import classNames from 'classnames';

import type {InputFailedValidators} from '../../form/layout/input';
import type {InputGroupRepeaterOptions} from './input-group-repeater';
import type {InputOptions, CustomInputOptions} from '../index';

import styles from 'styles/form/layout/input-group.scss';

import {mapRefs} from 'modules/helpers';

import {
    InputValidator,
    CustomInputValidator,
} from 'typings/form';

import * as Inputs from '../../form/layout/input-types';

import InputGroupRepeater from './input-group-repeater';

const inputTypes = Object.values(Inputs);

export type InputGroupOptions = {
    legend?: string | JSX.Element,

    className?: string,

    name?: string,

    defaultValue?: object,

    before?: JSX.Element,
    after?: JSX.Element,

    beforeInputs?: JSX.Element,
    inputs?: Array<InputOptions|CustomInputOptions>,
    afterInputs?: JSX.Element,

    inputGroups?: Array<InputGroupOptions>,

    repeater?: boolean|InputGroupRepeaterOptions
};

export type InputGroupProps = InputGroupOptions & {
    key?: number,
    children?: React.ReactNode|JSX.Element|JSX.Element[],
    onValidate?: (failedValidators : InputGroupFailedValidators) => void,
};

export type InputGroupFailedValidators = Array<
    InputFailedValidators |
    InputGroupFailedValidators |
    Array<Array<InputValidator|CustomInputValidator>>
>;

type InputGroupState = {
    failedValidators : InputGroupFailedValidators
};

/**
 * A group that wraps one or multiple inputs.
 */
export default
class InputGroup extends React.Component<InputGroupProps, InputGroupState> {
    private static baseClassName = 'input-group';
    public inputs : React.RefObject<Array<Inputs.Input|InputGroup|InputGroupRepeater>>;

    /**
     * @param {InputGroupProps} props
     */
    constructor(props: InputGroupProps) {
        super(props);

        this.inputs = React.createRef();

        this.state = {
            failedValidators: [],
        };

        this.onValidate = this.onValidate.bind(this);
    }

    /**
     * Gets the current failed validators of all inputs placed in this group.
     */
    get failedValidators() : InputGroupFailedValidators {
        return this.state.failedValidators;
    }

    /**
     * Captures the validation of all inputs placed in this group.
     * Additionally, checks whether all inputs are clear of failed validators.
     */
    onValidate() {
        this.setState({
            failedValidators: this.inputs.current
                .filter((current) => current.failedValidators.length)
                .map((current) => current.failedValidators),
        });

        if (typeof this.props.onValidate === 'function') {
            this.props.onValidate(this.state.failedValidators);
        }
    }

    /**
     * Wraps one or multiple inputs.
     * @return {React.ReactNode}
     */
    render() : React.ReactNode {
        const props = this.props;

        return <React.Fragment>
            {props.before ?? ''}
            <fieldset
                className={
                    classNames(
                        styles[InputGroup.baseClassName],
                        {
                            [`${styles[InputGroup.baseClassName]}--invalid`]:
                            this.state.failedValidators.length,
                            [`${InputGroup.baseClassName}-name-${props.name.replace(' ', '')}`]:
                            props.name,
                        },
                        props.className,
                    )
                }
            >
                {props.legend ? <legend>{props.legend}</legend> : ''}
                {props.beforeInputs ?? ''}
                {
                    mapRefs(
                        props.children,
                        [...inputTypes, InputGroup, InputGroupRepeater],
                        this.inputs,
                        {
                            onValidate: this.onValidate,
                        },
                        {
                            defaultValue: (child) =>
                                child.props.defaultValue ??
                                (
                                    (typeof props.defaultValue !== 'undefined') ?
                                        (
                                            props.defaultValue[child.props.name] ??
                                            undefined
                                        ) :
                                        undefined
                                ),
                        },
                    )
                }
                {props.afterInputs ?? ''}
            </fieldset>
            {props.after ?? ''}
        </React.Fragment>;
    }
}
