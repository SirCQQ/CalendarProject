import { Button } from "react-bootstrap";
import React from "react";
import axios from 'axios'
export default function Event({
  startHour,
  endHour,
  day,
  recurrence,
  recurrence_period,
  name,
  onClick,
  onDelete,_id,cookies
}) {

  return (
    <div onClick={onClick} className="event-container">
      <h5 className="event-t">{name}</h5>
      <div className="info-data">
        <div className="row">
          <div className="">Start hour: {startHour}</div>
          <div className="">Start hour: {endHour}</div>
        </div>
        <div className="row">
          <div className="date">Date: {formatDate(new Date(day))}</div>
          {recurrence ? (
            <div className="recurent">
              <img src="#" alt="recurent" />
              <p>{recurrence_period}</p>
            </div>
          ) : null}
        </div>
      </div>
      <Button className='delete'variant="outline-danger" onClick={(e)=>{
        deleteEvent(e,_id,onDelete,cookies)
      }}>X</Button>
    </div>
  );
}


function deleteEvent(e,_id,callback,cookies){
  e.stopPropagation();
  axios
  .delete(`/api/events/${_id}`, {
    headers: {
      "auth-token": cookies.get("token"),
    },
  })
  .then((resp) => {
    callback()
  });

}

function formatDate(date) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dateObj = date
  const month = monthNames[dateObj.getMonth()];
  const day = String(dateObj.getDate()).padStart(2, "0");
  const year = dateObj.getFullYear();
  const output = month + "\n" + day + "," + year;

  return output;
}
