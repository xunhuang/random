
group_by(.date) | map({
    date: .[0].date, 
    datelegacy: .[0].datelegacy, 
    covid_hospitalized:map(.covid_hospitalized) |add,
    covid_currentlyInICU:map(.covid_currentlyInICU) |add,
    inpatient_beds_capacity:map(.inpatient_beds_capacity) |add,
    inpatient_beds_used:map(.inpatient_beds_used) |add,
    adult_icu_beds_capacity:map(.adult_icu_beds_capacity) |add,
    adult_icu_bed_used:map(.adult_icu_bed_used) |add,
}) 