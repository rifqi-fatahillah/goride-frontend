import React, { Component } from 'react'
import PropTypes from 'prop-types';

import SuggestionBox from '../../../components/list/SuggestionBox';
import { extractTokenFromRes } from '../../../services/api'
import { connect } from 'react-redux';
import { createActiveBook, getActiveBookByMember } from '../../../services/api/v1/activeBooks';
import { reSetToken } from '../../../store/actions/auth'
import { setActiveBook } from '../../../store/actions/activeBook'

const MapInputs = props => {
  const mapPlaceSuggestionsToSuggestions = (placeSuggestions) => {
    if (placeSuggestions !== undefined) {
      return placeSuggestions.map(placeSuggestion => ({
        id: placeSuggestion.id,
        header: placeSuggestion.name,
        description: placeSuggestion.formatted_address
      }))
    }
    return undefined
  }

  const onItemClick = (id, fromOrTo) => {
    if (props.fromSuggestions) {
      const fromPlace = props.fromSuggestions.filter(place => place.id === id);
      if (fromPlace !== undefined && fromPlace.length > 0) {
        props.onSuggestionItemClick(fromPlace[0].name, fromPlace[0].lat, fromPlace[0].lng, fromOrTo)
      }
    }
    if (props.toSuggestions) {
      const toPlace = props.toSuggestions.filter(place => place.id === id);
      if (toPlace !== undefined && toPlace.length > 0) {
        props.onSuggestionItemClick(toPlace[0].name, toPlace[0].lat, toPlace[0].lng, fromOrTo)
      }
    }
  }

  const btnOrderClick = (event, withGopay) => {
    event.preventDefault();

    // TODO: with gopay logic
    const { member, srcLat, srcLng, dstLat, dstLng, from, to, distance, price, priceWithGopay, token } = props;

    createActiveBook(member.id, srcLat, srcLng, dstLat, dstLng, from, to, distance / 1000, price, priceWithGopay, token,
      (data) => props.reSetToken(extractTokenFromRes(data))
    )
      .then(res => {
        getActiveBookByMember(member.id, token,
          (data) => props.reSetToken(extractTokenFromRes(data))
        )
          .then(res => { 
            props.setActiveBook(res.active_book);
            props.btnOrderClickCallback();
          });
      });
  }

  const {
    from, to, onInputChange, clearInput, onInputFocus, isFromFocus, isToFocus, fromSuggestions, toSuggestions, distance, price, priceWithGopay } = props;

  const isDisabled = props.activeBook != null;
  return (
    <div className={`ui segment ${isDisabled ? "disabled" : " "}`} style={{ border: '1.5px solid #27ae60', margin: '1rem 4rem' }}>
      <h3 className="ui header">Booking Details</h3>
      <div className="row">
        <div className="col-lg-6">
          {/* FROM INPUT BOX */}
          <div className="ui form">
            <div className="inline fields">
              <div className="fourteen wide field">
                <label htmlFor="from">From</label>
                <div className="ui action input">
                  <input type="text" className={`${isDisabled ? "disabled" : ""}`} name="from" placeholder={isFromFocus ? "Input keyword or click from map" : "Search..."} onChange={onInputChange} value={props.from} onFocus={onInputFocus} />
                  <button className={`ui icon button negative ${isDisabled ? "disabled" : ""}`} onClick={() => clearInput("from")} >
                    <i className="trash alternate outline icon"></i>
                  </button>
                </div>
                {isFromFocus &&
                  <section style={{ position: 'absolute', top: '40px', left: '42px' }}>
                    <SuggestionBox
                      suggestions={mapPlaceSuggestionsToSuggestions(fromSuggestions)}
                      iconClass="map marker alternate"
                      onItemClick={(id) => onItemClick(id, "from")}
                    />
                  </section>
                }
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          {/* TO INPUT BOX */}
          <div className="ui form">
            <div className="inline fields">
              <div className="fourteen wide field" style={{ position: 'relative' }}>
                <label htmlFor="to">To</label>
                <div className="ui action input">
                  <input type="text" className={`${isDisabled ? "disabled" : ""}`} name="to" placeholder={isToFocus ? "Input keyword or click from map" : "Search..."} onChange={onInputChange} value={to} onFocus={onInputFocus} />
                  <button className={`ui icon button negative ${isDisabled ? "disabled" : ""}`} onClick={() => clearInput("to")}>
                    <i className="trash alternate outline icon"></i>
                  </button>
                </div>
                {isToFocus &&
                  <section style={{ position: 'absolute', top: '40px', left: '25px' }}>
                    <SuggestionBox
                      suggestions={mapPlaceSuggestionsToSuggestions(toSuggestions)}
                      iconClass="map marker alternate"
                      onItemClick={(id) => onItemClick(id, "to")}
                    />
                  </section>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      {(distance && price) &&
        <section>
          <div className="ui compact menu" style={{ margin: '1rem 0', backgroundColor: '#ecf0f1' }}>
            <div style={{ padding: '1rem', textAlign: 'center', borderRight: '1px solid darkgray' }}>
              <h3 style={{ margin: '1rem' }}>{`${Math.ceil(distance / 1000)} Km`}</h3>
            </div>
            <div style={{ padding: '.6rem', textAlign: 'center' }}>
              <h4 style={{ margin: '1rem' }}>Go-Pay</h4>
              <p style={{ marginTop: '-10px', marginBottom: '10px' }}>Rp. {priceWithGopay},-</p>
            </div>
            <div style={{ padding: '.6rem', textAlign: 'center' }}>
              <h4 style={{ margin: '1rem' }}>Normal</h4>
              <p style={{ marginTop: '-10px', marginBottom: '10px' }}>Rp. {price},-</p>
            </div>
          </div>
        </section>
      }
      <section id="section-btns" style={{ marginTop: '1rem' }}>
        <button className={`ui button orange ${isDisabled ? "disabled" : ""}`} onClick={(e) => btnOrderClick(e, true)}>Order With Go-Pay</button>
        <button className={`ui button green ${isDisabled ? "disabled" : ""}`} onClick={(e) => btnOrderClick(e, false)}>Order</button>
      </section>
    </div>
  )
}

MapInputs.propTypes = {
  onInputChange: PropTypes.func.isRequired,
  clearInput: PropTypes.func.isRequired,
  onInputFocus: PropTypes.func.isRequired,
  isFromFocus: PropTypes.bool.isRequired,
  isToFocus: PropTypes.bool.isRequired,
  fromSuggestions: PropTypes.array,
  toSuggestions: PropTypes.array,
  onSuggestionItemClick: PropTypes.func.isRequired,
  distance: PropTypes.number,
  price: PropTypes.number,
  priceWithGopay: PropTypes.number,
  srcLat: PropTypes.number,
  srcLng: PropTypes.number,
  dstLat: PropTypes.number,
  dstLng: PropTypes.number,
  btnOrderClickCallback: PropTypes.func.isRequired
}

function mapStateToProps(reduxState) {
  return {
    activeBook: reduxState.activeBook,
    member: reduxState.currentUser.user,
    token: reduxState.currentUser.token
  }
}

export default connect(mapStateToProps, {
  reSetToken,
  setActiveBook
})(MapInputs)