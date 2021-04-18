
import React, { Component } from 'react'
import { Form, Row, FormControl, FormLabel, Container, Button, FormGroup } from 'react-bootstrap'
import './Auth.css'
import axios from 'axios'
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

class Auth extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };  
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      repassword: '',
      login: true,
      usernameError: '',
      passwordError: '',
      repasswordError: ''

    }
    this.onChange = this.onChange.bind(this)
    this.changeLogin = this.changeLogin.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }
  onChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
      usernameError: '',
      passwordError: '',
      repasswordError: ''
    })
  }
  changeLogin(e) {
    e.preventDefault()
    this.setState({
      login: !this.state.login,
      usernameError: '',
      passwordError: '',
      repasswordError: ''
    })
  }

  async onSubmit(e) {
    e.preventDefault();
    let { password, username, repassword, login } = this.state
    let body = JSON.stringify({ password, username })
    if(!login && password !== repassword) {
        this.setState({ repasswordError: "Password and confirm password does not match", passwordError: 'Password and confirm password does not match' })
        return
      
    }
    try {
      let url = `/api/user${login ? "/login" : "/register"}`
      let response = await axios.post(url, body,{headers:{
        "Content-Type":"application/json"
      }})
      const { cookies } = this.props;
      cookies.set('token', response.data.jwt, { path: '/' });
    }
    catch (err) {
      let { error, message } = err.response.data
      if (error === "username") {
        this.setState({ usernameError: message })
      }
      if (error === "password") {
        this.setState({ passwordError: message })
      }

    }
  }

  render() {
    let { login } = this.state
    return (
      <Container className="d-flex justify-content-center mt-5 align-items-center full-view">

        <Form className="auth" onSubmit={this.onSubmit}>
          <h2>{login ? 'Login' : 'Register'}</h2>
          <Row>
            <FormGroup className="full-width">
              <FormLabel>
                Username
            </FormLabel>
              <FormControl className="full-width" type="text" name="username" value={this.state.username} onChange={this.onChange} isInvalid={this.state.usernameError} required />
              <FormControl.Feedback type="invalid">{this.state.usernameError}</FormControl.Feedback>
            </FormGroup>
          </Row>
          <Row>
            <FormGroup className="full-width">
              <FormLabel>
                Password
            </FormLabel>
              <FormControl className="full-width" type="password" name="password" value={this.state.password} onChange={this.onChange} isInvalid={this.state.passwordError} required />
              <FormControl.Feedback type="invalid">{this.state.passwordError}</FormControl.Feedback>
            </FormGroup>
          </Row>
          {!login ? <Row>
            <FormGroup className="full-width">
              <FormLabel>
                Confirm Password
            </FormLabel>
              <FormControl className="full-width" type="password" name="repassword" value={this.state.repassword} onChange={this.onChange} isInvalid={this.state.repasswordError} required />
              <FormControl.Feedback type="invalid">{this.state.repasswordError}</FormControl.Feedback>
            </FormGroup>
          </Row> : null}
          <Row>
            <Button type="submit" className="auth-btn">{login ? 'Login' : 'Register'}</Button>
          </Row>
          <Row>
            <div onClick={this.changeLogin} className="change-auth">
              {login ?
                (<p>If you dont have an account, register <strong>here</strong></p>)
                :
                (<p>If you already have an account login <strong>here</strong></p>)}
            </div>
          </Row>
        </Form>

      </Container>
    )
  }
}


export default withCookies(Auth)