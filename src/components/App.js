import React from "react";
import PropTypes from 'prop-types';

import styles from "./styles/app.less"

import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap'

class App extends React.Component {

	componentWillMount() {
		this.props.onCreate();
	}

 	render() {
    	return <div className='app_container'>
        <Navbar inverse collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="#brand"><img src="./assets/logo_no_bg.png"  width='24px'/></a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <NavItem eventKey={1} href="/contest">
                Trending
              </NavItem>
            </Nav>
            <Nav pullRight>
              <NavItem eventKey={1} href="#">
                Sign Up
              </NavItem>
              <NavItem eventKey={2} href="http://tribela.io">
                About Us
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
    		{this.props.children}
    	</div>
  	}

}

App.propTypes = {
	onCreate: PropTypes.func.isRequired,
	location: PropTypes.string
}

App.defaultProps = {

}

export default App;