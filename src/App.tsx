import React, {useState} from 'react';
import './App.css';
import styled from 'styled-components';
import {Step, Stepper, CircularProgress, Button, StepLabel} from '@mui/material'
import {Formik, Form, Field, FormikConfig, FormikValues} from 'formik'
import {TextField, CheckboxWithLabel} from 'formik-mui'
import {string, object, mixed, number} from 'yup'

const sleep = async(time:number) => {
  await new Promise(acc => setTimeout(acc, time));
}

function App() {
  return (
    <FormikStepper initialValues={{
      firstname: '',
      lastname: '',
      millionaire: false,
      amtmoney: 0,
      description: ''
    }} onSubmit={async(values, helpers) => {
      await sleep(3000);
      console.log(values);
    }}>
        <FormikStep label='Personal Details' validationSchema={object({
          firstname: string().required('This field is mandatory!').min(3, 'Name needs to have at least 3 characters!')
        })}>
          <Field fullWidth name='firstname' component={TextField} label='First Name'/>
          <Field fullWidth name='lastname' component={TextField} label='Last Name'/>
          <Field name='millionaire' component={CheckboxWithLabel} Label={{label:'Are you a millionaire?'}}/>
        </FormikStep>
        <FormikStep label='Bank Details' validationSchema={object({
          amtmoney: mixed().when('millionaire', {
            is: true,
            then: number().required().min(1_000_000, 'He is supposed to be a millionaire afterall!'),
            otherwise: number().required().min(0)
          })
        })}>
          {/* The otherwise above can be avoided if in the field below you add type='number' */}
          <Field fullWidth name='amtmoney' component={TextField} label='Amount of money you have'/>
        </FormikStep>
        <FormikStep label='Description'>
          <Field fullWidth name='description' component={TextField} label='Description'/>
        </FormikStep>
        
    </FormikStepper>
  );
}

export const FormikStepper = ({children, ...props}:FormikConfig<FormikValues>) => {
  const [step, setstep] = useState(0);
  const [completed, setcompleted] = useState(false);
  const childArray = React.Children.toArray(children) as React.ReactElement<FormikStepType>[];
  const currentChild = childArray[step];
  const isLastStep = () => {
    return step === childArray.length-1;
  }
  return(
    <Formik {...props} onSubmit={async(values, helpers) => {
      // isLastStep() ? await props.onSubmit(values, helpers) : setstep(step+1);
      if(isLastStep()){
        await props.onSubmit(values, helpers);
        setcompleted(true);
      }else{
        setstep(step+1);
      }
    }}
    validationSchema={
      currentChild.props.validationSchema
    }>
      {({isSubmitting}) => (
      <Form>
        <Stepper alternativeLabel activeStep={step}>{
          childArray.map((eachChild, index) => {
            return (<Step key={index} completed={step>index || completed}>
              <StepLabel>{eachChild.props.label}</StepLabel>
            </Step>)
          })
          }</Stepper>
        {currentChild}
        {step>0 && <button onClick={() => setstep(step-1)} disabled={isSubmitting || completed}>Back</button>}
        <Button startIcon={isSubmitting && <CircularProgress size={20}/>} disabled={isSubmitting || completed} type='submit'>{isLastStep() ? 'Submit' : 'Next'}</Button>
      </Form>
      )}
    </Formik>
  )
}

//With this, you are picking the params of FormikConfig<FormikValues> that you want and avoiding others with the
//Pick aand adding the ones you want below basically where you want the params of children, validationSchema and
//label from any of the FormikSteps
export interface FormikStepType extends Pick<FormikConfig<FormikValues>, 'children' | 'validationSchema'>{
  label:string
}

export const FormikStep = ({children}: FormikStepType) => {

  return(
    <>
      {children}
    </>
  )
}



export default App;
