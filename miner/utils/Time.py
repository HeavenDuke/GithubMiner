import calendar

import time as t


class Time(object):
    def __init__(self, time = None, year = None, month = None, day = None, hour = None):
        if time is None:
            if year is None or month is None or day is None or hour is None:
                time = t.time()
                time = t.localtime(time)
                self.year = t.strftime("%Y", time)
                self.month = t.strftime("%m", time)
                self.day = t.strftime("%d", time)
                self.hour = t.strftime("%H", time)
            else:
                self.year = "%d" % year
                self.month = "%02d" % month
                self.day = "%02d" % day
                self.hour = "%d" % hour

    def an_hour_before(self):
        year = int(self.year)
        days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        month = int(self.month) - 1
        day = int(self.day)
        hour = int(self.hour)
        update_day = False
        hour -= 1
        if hour < 0:
            hour = 23
            day -= 1
        if day <= 0:
            month -= 1
            day = days[month % 12]
            update_day = True
        if month < 0:
            year -= 1
            month = 11
        if calendar.isleap(year) and month == 1 and update_day:
            day += 1
        return Time(year = year, month = month + 1, day = day, hour = hour)

    def a_day_before(self):
        year = int(self.year)
        days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        month = int(self.month) - 1
        day = int(self.day)
        hour = int(self.hour)
        update_day = False
        day -= 1
        if day <= 0:
            month -= 1
            day = days[month % 12]
            update_day = True
        if month < 0:
            year -= 1
            month = 11
        if calendar.isleap(year) and month == 1 and update_day:
            day += 1
        return Time(year = year, month = month + 1, day = day, hour = hour)

    def a_week_before(self):
        time = self
        for i in range(7):
            time = time.a_day_before()
        return time

    def a_month_before(self):
        time = self
        for i in range(30):
            time = time.a_day_before()
        return time

    def totime(self):
        strtime = "%s-%s-%s %s:00:00" % (self.year, self.month, self.day, self.hour)
        return t.mktime(t.strptime(strtime, "%Y-%m-%d %H:%M:%S"))

    def __eq__(self, other):
        year = int(self.year) == int(other.year)
        month = int(self.month) == int(other.month)
        day = int(self.day) == int(other.day)
        hour = int(self.hour) == int(other.hour)
        return year and month and day and hour

    def __ne__(self, other):
        return not self.__eq__(other)