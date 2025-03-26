<div align="center">
    <img src="./public/logo_favicon.png" width="100" />
    <h1 align="center">Calendula</h1>
</div>


## 🛠 Technologies
<p align="center">
	<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white" alt="TypeScript">
	<img src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black" alt="React">
	<img src="https://img.shields.io/badge/Redux-764ABC.svg?style=flat&logo=Redux&logoColor=white" alt="Redux">
	<img src="https://img.shields.io/badge/React_Router-CA4245.svg?style=flat&logo=React-Router&logoColor=white" alt="React Router">
	<img src="https://img.shields.io/badge/Axios-5A29E4.svg?style=flat&logo=Axios&logoColor=white" alt="Axios">
	<img src="https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white" alt="JSON">
	<img src="https://img.shields.io/badge/Vite-646CFF.svg?style=flat&logo=Vite&logoColor=white" alt="Vite">
	<img src="https://img.shields.io/badge/FullCalendar-1E90FF.svg?style=flat&logo=FullCalendar&logoColor=white" alt="FullCalendar">
	<img src="https://img.shields.io/badge/Shad/cn-000000.svg?style=flat" alt="ShadCN">
	<img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4.svg?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
	<img src="https://img.shields.io/badge/CSS-1572B6.svg?style=flat&logo=CSS3&logoColor=white" alt="CSS">
</p>


## 🗓️ Overview
Calendula is a calendar project inspired by Google Calendar. It is built using React and Tailwind and features a highly responsive and intuitive interface.

The Calendula project is designed for convenient task and event planning. It combines a minimalist design with robust functionality, allowing users to easily manage their time while also supporting customizable color themes.


## 🎯 Basic features
* User
	* Registration and email confirmation
	* Authorisation
	* Password recovery via email
	* Has its own default Main user calendar
	* Has the 'National holidays' calendar for the user's country
 * Calendars
 	* Contains title, description, color, participants
    	* Invite calendar participants via email
  	* Create calendars via a pop-up window
   	* Calendars can be hidden to filter events 
	* Users can change the colour of any calendar for themselves
	* Roles of Participants in Calendars
 		* Owner can perform all CRUD operations (unlike the main calendar) with the invitation of other registerd users
   		* Member can view the calendar and its events; CRUD operations on own events in this calendar with the invitation of other registerd users
     		* Viewer can view the calendar and its events
       * All calendars are clickable and contain information for preview
* Events
	* Contains title, start date and time, end date and time, associated calendar, type ('meeting', 'reminder', 'task'), description, color, participants
 	* Invite event participants via email
 	* Create events by clicking on the blank space on the calendar itself via a pop-up window, as well as by clicking a 'Create' button and redirecting to a separate page
    	* Edit events by clicking; delete via a special button
  	* By default, colour events based on the colour of the associated calendar
	* Users can change the colour of any event for themselves
        * All events are clickable and contain information for preview
      	* Display all events in accordance with their duration


## 🌈 Creative features
* User
	* View user's personal data
* Calendars
	* Grouping calendars into team and system calendars
	* Calendar 'Birthdays' of company employees
	* Unsubscribing from the calendar via the ‘Unsubscribe’ button
	* Calendar owner's mark
	* Search for users to participate by full name or email
  	* Searchable drop-down list of users to participate in
* Events
	* Preview of the event type in the title
	* Displaying the attendance status of participants
	* Drag and drop to change the date or time of event
	* Resize to change the event duration
	* Event owner's mark
	* Search for users to participate by full name or email
  	* Searchable drop-down list of users to participate in
   	* 'All day' event duration
	* Default duration for events is 1 hour
	* Categories: 'work', 'home', 'hobby'
	* Notifications before: '10 min', '30 min', '1 h', '1 d' 
	* Attendance statuses: 'yes', 'no', 'maybe'
   	* Changing the event design depending on the user's attendance status
* Home page
	* Jump to today via the 'Today' button
	* Search for events by title and description
	* Different representation of the calendar: month, weeek, day
	* Monthly calendar in the sidebar
	* Synchronise between the monthly calendar in the sidebar and main event view
	* Show the current day and time on the calendar


## 🚀 Get started
### ⚙️ Installation

1. Run the [calendula-backend](https://github.com/Strawberry-Team/calendula-backend) project.

2. Go to the project folder.

3. Install the dependencies:
```sh
  npm install
```

4. Running:
```sh
  npm run dev
```
