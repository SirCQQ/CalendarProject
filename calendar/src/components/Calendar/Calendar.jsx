import React, { Component } from "react";
import { Form, FormControl, Modal, Button } from "react-bootstrap";
import axios from "axios";
import Event from "./Event";
import "react-calendar/dist/Calendar.css";
import TimeRangePicker from "@wojtekmaj/react-timerange-picker";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import Calendar from "react-calendar";
import "./Events.css";
import * as moment from "moment";
const newEvent = {
  startHour: "00:00",
  endHour: "00:00",
  day: new Date(),
  recurrence: false,
  recurrence_period: "d",
  name: "",
};
class CalendarPersonal extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      addEvent: false,
      eventType: "create",
      event: { ...newEvent },
      error: "",
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.fetchEvents = this.fetchEvents.bind(this);
  }

  componentDidMount() {
    let { cookies } = this.props;
    this.fetchEvents();
    this.timeinterval = setInterval(() => {
      this.state.events.forEach((e) => {
        let currentDate = new Date();
        let evDate = new Date(e.day);
        evDate.setHours(e.startHour.split(":")[0]);
        evDate.setMinutes(e.startHour.split(":")[1]);
        let currentMoment = moment(currentDate);
        let evMoment = moment(evDate);
        if (
          isSameMonthAndYear(evMoment, currentMoment) &&
          0 <= timeDiff(evMoment, currentMoment) <= 5 && !e.recurrence
        ) {
          alert(
            `${e.name} will start in ${Math.ceil(
              evMoment.diff(currentMoment) / (1000 * 60)
            )} minutes single day `
          );
        }
        else if (timeDiff(evMoment, currentMoment) < 0 && !e.recurrence) {
          axios
            .delete(`/api/events/${e._id}`, {
              headers: {
                "auth-token": cookies.get("token"),
              },
            })
            .then((resp) => {
              this.fetchEvents();
            });
        }
        else if (
          isSameDayAndMonth(evMoment, currentMoment) &&
          e.recurrence === "m" &&
          0 < timeDiff(evMoment, currentMoment) < 5
        ){
          alert(
            `${e.name} will start in ${Math.ceil(
              evMoment.diff(currentMoment) / (1000 * 60)
            )} minutes single day `
          );
        }
          else if (
            e.recurrence === "w" && 
            sameDayOfWeek(evMoment, currentMoment)
            ) {
              alert(
                `${e.name} will start in ${Math.ceil(
                  evMoment.diff(currentMoment) / (1000 * 60)
                )} minutes single day `
              );
          }
      });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timeinterval);
  }
  async onSubmit(e) {
    e.preventDefault();
    let { cookies } = this.props;
    try {
      let response = await axios.post(
        "/api/events",
        { ...this.state.event },
        {
          headers: {
            "auth-token": cookies.get("token"),
          },
        }
      );
      if (response.status === 200 && !response.data.error) {
        this.fetchEvents();
      } else {
        this.setState({ addEvent: false, error: response.data.error });
      }
    } catch (e) {
      console.log(e);
    }
  }

  fetchEvents() {
    let { cookies } = this.props;
    try {
      axios
        .get("/api/events", {
          headers: {
            "auth-token": cookies.get("token"),
          },
        })
        .then((resp) => {
          this.setState({
            events: resp.data.events,
            addEvent: false,
            event: { ...newEvent },
          });
        });
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    let { events, addEvent } = this.state;

    return (
      <div>
        <Button
          onClick={() => {
            this.setState({ addEvent: true });
          }}
        >
          {" "}
          Add event +
        </Button>
        <div>
          Events:
          <div className="events">
            {events &&
              events.map((e, i) => (
                <Event
                  onClick={() => {
                    let newEvent = { ...e, day: new Date(e.day) };
                    this.setState({
                      event: { ...newEvent },
                      addEvent: true,
                      eventType: "update",
                    });
                  }}
                  {...e}
                  key={e._id}
                  onDelete={this.fetchEvents}
                  cookies={this.props.cookies}
                />
              ))}
          </div>
        </div>
        {addEvent && (
          <Modal show={this.state.addEvent}>
            <Form onSubmit={(e) => this.onSubmit(e)}>
              <Modal.Title style={{ textAlign: "center" }}>
                {this.state.eventType === "create"
                  ? "Create new event"
                  : "Edit Event"}
              </Modal.Title>

              <div className="add-event">
                <div className="d-flex justify-content-between align-items-center">
                  Event name:{" "}
                </div>
                <FormControl
                  type="text"
                  name="name"
                  value={this.state.event.name}
                  onChange={(e) => {
                    let { event } = this.state;
                    event[e.target.name] = e.target.value;
                    this.setState({ event: { ...event } });
                  }}
                  required
                />
                <div className="d-flex justify-content-between align-items-center">
                  Select Date
                </div>
                <Calendar
                  onChange={(e) => {
                    let { event } = this.state;
                    event.day = e;
                    this.setState({ event: event });
                  }}
                  value={this.state.event.day}
                  minDate={new Date()}
                />
                <div className="d-flex justify-content-between align-items-center">
                  Interval{" "}
                  <TimeRangePicker
                    disableClock={true}
                    value={[
                      this.state.event.startHour,
                      this.state.event.endHour,
                    ]}
                    onChange={(e) => {
                      let newTime = ["00:00", "00:00"];
                      if (e) {
                        newTime[0] = e[0];
                        newTime[1] = e[1];
                      }
                      let { event } = this.state;
                      event.startHour = newTime[0];
                      event.endHour = newTime[1];
                      this.setState({ event: event });
                    }}
                  />
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  Recursive{" "}
                  <FormControl
                    style={{ width: "unset" }}
                    type="checkbox"
                    checked={this.state.event.recurrence}
                    name={"recurrence"}
                    onChange={(e) => {
                      let { event } = this.state;

                      event.recurrence = e.target.checked;
                      this.setState({ event });
                    }}
                  />
                </div>
                {this.state.event.recurrence && (
                  <div
                  // className="d-flex justify-content-between align-items-center"
                  >
                    <Form.Group className="d-flex">
                      <Form.Label>Recursive interval</Form.Label>
                      <Form.Control
                        style={{ width: "unset" }}
                        value={this.state.event.recurrence_period}
                        as="select"
                        name="recurrence_period"
                        onChange={(e) => {
                          let { event } = this.state;
                          event[e.target.name] = e.target.value;
                          this.setState({ event: { ...event } });
                        }}
                      >
                        <option value="d">Every Day</option>
                        <option value="w">Every Week</option>
                        <option value="m">Every Month</option>
                        <option value="y">Every Year</option>
                      </Form.Control>
                    </Form.Group>
                  </div>
                )}
              </div>
              <Modal.Footer>
                <Button
                  onClick={() => {
                    this.setState({ addEvent: false, event: { ...newEvent } });
                  }}
                >
                  {" "}
                  Close{" "}
                </Button>
                <Button
                  type="submit"
                  onClick={(e) => {
                    this.onSubmit(e);
                  }}
                >
                  {" "}
                  Save{" "}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        )}
        <Modal show={this.state.error}>
          <Modal.Title>Error</Modal.Title>
          <Modal.Body>
            <div className="d-flex justify-content-between align-items-center">
              {this.state.error}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                this.setState({ error: "" });
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default withCookies(CalendarPersonal);

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
  const dateObj = date;
  const month = monthNames[dateObj.getMonth()];
  const day = String(dateObj.getDate()).padStart(2, "0");
  const year = dateObj.getFullYear();
  const output = month + "\n" + day + "," + year;

  return output;
}

function isSameDayAndMonth(m1, m2) {
  return m1.date() === m2.date() && m1.month() === m2.month();
}

function isSameMonthAndYear(m1, m2) {
  return (
    m1.date() === m2.date() &&
    m1.month() === m2.month() &&
    m1.year() === m2.year()
  );
}

function timeDiff(m1, m2) {
  let t1 = moment(m1.format("hh:mm:ss"), "hh:mm:ss");
  let t2 = moment(m2.format("hh:mm:ss"), "hh:mm:ss");
  let diff = moment.duration(t1.diff(t2));
  return  Math.round(diff.asMinutes() % 60)
}

function sameDayOfWeek(m1, m2) {
  return m1.isoWeekday() === m2.isoWeekday();
}
