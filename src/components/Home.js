import React from "react";
import PropTypes from 'prop-types';


class Home extends React.Component {
  render (){
    return <img width='100%' src='./assets/stuff_war.png'/>
  }
}

Home.propTypes = {
	text: PropTypes.string
}

export default Home;