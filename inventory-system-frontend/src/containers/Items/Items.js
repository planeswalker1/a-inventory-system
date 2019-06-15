import React, {Component} from 'react';
import { initItemsAction } from '../../redux/actions/itemsAction';
import { connect } from 'react-redux';

import ItemsList from '../../Components/UI/List';
import { Link } from 'react-router-dom';
import classes from './Items.module.css';


/**
 we need to pass the 'id' route parameter to the initItemsAction for the request to get items
 we need to store this in a variable because we don't have access to the paramater of the url in the mapDispatchToProps
 */
let roomId = '';

class Items extends Component {
  componentDidMount() {
    console.log('about to request GET http://localhost:3001/rooms/items');
    console.log('this.props');
    console.log(this.props);
    console.log('this.props.match.params.id', this.props.match.params.id);
    if (!localStorage.token) {
      this.props.history.replace('/');
      return;
    }
    roomId = this.props.match.params.id;
    console.log('roomId', roomId);
    this.props.initItems(roomId, this.props.history);
  }

  render () {
    console.log('items from this.props.items from redux', this.props.items.items);
    console.log('roomName from this.props.items from redux', this.props.items.roomName);
    let items = '';
    if (this.props.items.items) {
      items = this.props.items.items;
    }
    console.log('items variable', items);
    return (
      <React.Fragment>
        <h1 className={classes['title']}>{this.props.items.roomName}</h1>
        <div className={classes['box']}>
          <Link to={'/items/create/' + this.props.match.params.id} className={classes['link']}>create new item</Link>
        </div>
        <ItemsList url='/items/update/' items={items} />
      </React.Fragment>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    items: state.items.items
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    initItems: (roomId, history) => {
      console.log('dispaching initItemsAction');
      dispatch(initItemsAction(roomId, history));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Items);