function calculateTime(startTime, endTime) {
    var startTimeArray = startTime.split(":");
    var startInputHrs = parseInt(startTimeArray[0]);
    var startInputMins = parseInt(startTimeArray[1]);
    
    var endTimeArray = endTime.split(":");
    var endInputHrs = parseInt(endTimeArray[0]);
    var endInputMins = parseInt(endTimeArray[1]);
    
    var startMin = startInputHrs*60 + startInputMins;
    var endMin = endInputHrs*60 + endInputMins;
    
    var result;
    
    if (endMin < startMin) {
        var minutesPerDay = 24*60; 
        result = minutesPerDay - startMin;  // Minutes till midnight
        result += endMin; // Minutes in the next day
    } else {
        result = endMin - startMin;
    }
    
    var minutesElapsed = result % 60;
    var hoursElapsed = (result - minutesElapsed) / 60;
    
    return hoursElapsed + ":" + (minutesElapsed < 10 ? '0'+minutesElapsed : minutesElapsed) 
}

function timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + " soat  " + rminutes + " daqiqa";
}

module.exports = {
    calculateTime,
    timeConvert
}