import React from "react";
import PropTypes from 'prop-types';
import Modal from 'react-modal'

import styles from './styles/app.less'
import CloseIcon from 'material-ui/svg-icons/navigation/close'

import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
    this.state.isModalOpened = null

    this.handleModalCloseRequest = this.handleModalCloseRequest.bind(this)
  }

	componentWillMount() {
		this.props.onCreate();
  }

  handleModalCloseRequest() {
    this.setState({
      openedModel: null
    })
  }

 	render() {
    	return (
        <div className='app_container'>
          <Navbar inverse collapseOnSelect>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="/"><img src="./assets/logo_no_bg.png"  width='24px'/></a>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav>
                <NavItem eventKey={1} href="/trending">
                  Trending
                </NavItem>
              </Nav>
              <Nav pullRight>
                <NavItem eventKey={1} onClick={() => {
                  console.log(this.state)
                  if (this.state.isModalOpened !== true) {
                    this.setState({openedModel: 'signup'})
                  }
                }}>
                  Sign Up
                </NavItem>
                <NavItem eventKey={1} onClick={() => {
                  console.log(this.state)
                  if (this.state.isModalOpened !== true) {
                    this.setState({openedModel: 'login'})
                  }
                }}>
                  Log In
                </NavItem>
                <NavItem eventKey={2} href="http://tribela.io">
                  About Us
                </NavItem>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          {this.props.children}
          <Modal
            ref='signup_modal'
            id='signup_modal'
            ariaHideApp={false}
            shouldCloseOnOverlayClick={true}
            isOpen={this.state.openedModel === 'signup'}
            onRequestClose={this.handleModalCloseRequest}
            className='app_modal'
            overlayClassName='modal_overlay'
          >
            <form className='modal_form'>
               <CloseIcon className='form_close_icon' onClick={this.handleModalCloseRequest} style={{color: '#cccccc'}}/>
              <div>
                Sign Up
              </div>
              <div className='form_field'>
                <label htmlFor='username'>
                  Username
                </label>
                <input type='text' name='username'/>
              </div>
              <div className='form_field'>
                <label htmlFor='username'>
                  Email Address
                </label>
                <input type='text' name='email'/>
              </div>
              <div className='form_field'>
                <label htmlFor='username'>
                  Password
                </label>
                <input type='text' name='password'/>
              </div>
              <div className='form_button'>
                <input type='submit' value='Join' />
              </div>
            </form>
          </Modal>
          <Modal
            ref='login_modal'
            id='login_modal'
            ariaHideApp={false}
            shouldCloseOnOverlayClick={true}
            isOpen={this.state.openedModel === 'login'}
            onRequestClose={this.handleModalCloseRequest}
            className='app_modal'
            overlayClassName='modal_overlay'
          >
            <form className='modal_form'>
               <CloseIcon className='form_close_icon' onClick={this.handleModalCloseRequest} style={{color: '#cccccc'}}/>
              <div>
                Login
              </div>
              <div className='form_field'>
                <label htmlFor='username'>
                  Username
                </label>
                <input type='text' name='username'/>
              </div>
              <div className='form_field'>
                <label htmlFor='username'>
                  Password
                </label>
                <input type='text' name='password'/>
              </div>
              <div className='form_button'>
                <input type='submit' value='Log In' />
              </div>
            </form>
          </Modal>
        </div>
      )
  	}

}

App.propTypes = {
	onCreate: PropTypes.func.isRequired,
	location: PropTypes.string
}

App.defaultProps = {

}

export default App;