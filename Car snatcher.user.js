// ==UserScript==
// @name         Car snatcher
// @namespace    http://tampermonkey.net/
// @version      2024-08-15
// @description  Cars snatcher for karlstadsbilkooperativ.org
// @author       Henrik
// @match        https://medlem.karlstadsbilkooperativ.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=karlstadsbilkooperativ.org
// @grant        none
// ==/UserScript==

const SearchTimeoutInSeconds = 30;
const SchemaTable = document.querySelector("table.schema");
const urlParams = new URLSearchParams(window.location.search);

const searchForCar = (startDate, endDate) => {
    console.log("Searching for a car...");
    const cars = getAvailableCars()
        .filter(car => car.bookings
            .find(booking => booking.start > startDate && booking.start < endDate
                || booking.end > startDate && booking.end < endDate
                || startDate >= booking.start && endDate <= booking.end) == null);

    return cars;
};

const parseTime = (timeSpanStr) => {
    const currentYear = new Date().getFullYear();
    const match = timeSpanStr.match(/([0-9]{1,2})\/([0-9]{1,2}) ([0-2]{1}[0-9]{1}:00) - ([0-9]{1,2})\/([0-9]{1,2}) ([0-2]{1}[0-9]{1}:00)/);
    if (match.length != 7) {
        return null;
    }

    const startDateTimeStr = `${currentYear}-${match[2]}-${match[1]} ${match[3]}`;
    const endDateTimeStr = `${currentYear}-${match[5]}-${match[4]} ${match[6]}`;

    const startDate = new Date(startDateTimeStr);
    const endDate = new Date(endDateTimeStr);

    return {
        start: startDate,
        end: endDate
    };
}

const getBookingsForCar = (element) => {
    const bookings = [];

    const parentElement = element.parentElement;
    const matches = parentElement.innerHTML.matchAll(/(?<=(?:(?:Bokad)|(?:Reserverad)).+)([0-9]{1,2}\/[0-9]{1,2} [0-2]{1}[0-9]{1}:00 - [0-9]{1,2}\/[0-9]{1,2} [0-2]{1}[0-9]{1}:00)(?=\.">\&nbsp;)/g);

    matches.forEach(match => {
        if (match === null || match.length != 2) {
            return;
        }

        const booking = parseTime(match[1]);
        if (bookings.findIndex(b => b.start.getTime() == booking.start.getTime() && b.end.getTime() == booking.end.getTime()) < 0) {
            bookings.push(booking);
        }
    });

    return bookings;
}

const getAvailableCars = () => {
    const cars = [];
    document.querySelectorAll("td.car")
        .forEach(element => {
            const matches = element.innerHTML.match(/<b>([a-zåäöA-ZÅÄÖ]+)<\/b><br>([A-Z]{3}[0-9]{2,3}[A-Z]?)<br>/);
            if (matches == null || matches.length != 3) {
                return;
            }

            cars.push({
                name: matches[1],
                regNo: matches[2],
                bookings: getBookingsForCar(element)
            });
        });

    return cars;
}

const reload = ()  => {
    const url = location.href.replace(location.search, "");
    urlParams.delete("WEEK");
    location.href = `${url}${urlParams.size ? "?" : ""}${urlParams.toString()}`;
}

const createBooking = (car, startDate, endDate) => {
    console.log(`Bokar ${car.name} från ${startDate.toLocaleString("sv-SE")} till ${endDate.toLocaleString("sv-SE")}`);
    const form = document.getElementById("bookingForm");
    const matchString = `<option value="([0-9]+)">${car.name}`;
    const carIdMatch = form.innerHTML.match(RegExp(matchString));
    if (carIdMatch.length != 2) {
        throw Error(`Failed to retrieve car id for ${car.name}`);
    }

    const carId = carIdMatch[1];
    const startDay = startDate.getDate().toString();
    const startYearMonth = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, "0")}`;
    const startTime = startDate.getHours().toString();
    const endDay = endDate.getDate().toString();
    const endYearMonth = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, "0")}`;
    const endTime = endDate.getHours().toString();

    document.querySelector(`select[name=CarID]`).value = carId;
    document.getElementById('select_StartDay').value = startDay;
    document.getElementById('select_StartYearMonth').value = startYearMonth;
    document.getElementById('select_StartTime').value = startTime;
    document.getElementById('select_EndDay').value = endDay;
    document.getElementById('select_EndYearMonth').value = endYearMonth;
    document.getElementById('select_EndTime').value = endTime;

    form.submit();
}

(function() {
    'use strict';
    const searching = urlParams.get("searching") === "true";
    const startButton = document.createElement("button");
    startButton.innerText = "Starta sökning";

    const stopButton = document.createElement("button");
    stopButton.innerText = "Stoppa sökning";

    const date = new Date();
    date.setMinutes(0);
    date.setSeconds(0);
    date.setHours(date.getHours() + 1);

    const startDateInput = document.createElement("input");
    startDateInput.id = "startDateInput";
    startDateInput.type = "text";
    startDateInput.value = urlParams.get("startDateInput") ?? date.toLocaleString("sv-SE");

    const endDateInput = document.createElement("input");
    endDateInput.id = "endDateInput";
    endDateInput.type = "text";
    date.setHours(date.getHours() + 2);
    endDateInput.value = urlParams.get("endDateInput") ?? date.toLocaleString("sv-SE");

    const endDateInputLabel = document.createElement("span");
    endDateInputLabel.innerHTML = "Önskat tilldatum:";

    const startDateInputLabel = document.createElement("span");
    startDateInputLabel.innerHTML = "Önskat fråndatum:";

    SchemaTable.parentNode.insertBefore(startDateInputLabel, SchemaTable);
    SchemaTable.parentNode.insertBefore(startDateInput, SchemaTable);
    SchemaTable.parentNode.insertBefore(document.createElement("br"), SchemaTable);
    SchemaTable.parentNode.insertBefore(endDateInputLabel, SchemaTable);
    SchemaTable.parentNode.insertBefore(endDateInput, SchemaTable);
    SchemaTable.parentNode.insertBefore(document.createElement("br"), SchemaTable);
    SchemaTable.parentNode.insertBefore(startButton, SchemaTable);
    SchemaTable.parentNode.insertBefore(stopButton, SchemaTable);

    const wantedStartDate = new Date(startDateInput.value);
    const wantedEndDate = new Date(endDateInput.value);

    startButton.onclick = () => {
        urlParams.set("searching", "true");
        urlParams.set("startDateInput", startDateInput.value);
        urlParams.set("endDateInput", endDateInput.value);
        reload();
    };

    stopButton.onclick = () => {
        urlParams.set("searching", "false");
        urlParams.set("startDateInput", startDateInput.value);
        urlParams.set("endDateInput", endDateInput.value);
        reload();
    };

    if (searching) {
        console.log(`Searching for a car between ${startDateInput.value} and ${endDateInput.value}`);
        const availableCars = searchForCar(wantedStartDate, wantedEndDate);
        if (availableCars.length) {
            console.log(`Found ${availableCars.length} available car(s)`);
            createBooking(availableCars[0], wantedStartDate, wantedEndDate);
        } else {
            setInterval(() => {
                if (searching) {
                    reload();
                }
            }, SearchTimeoutInSeconds * 1000);
        }
    }
})();

