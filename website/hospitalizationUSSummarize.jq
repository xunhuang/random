
group_by(.date) | map({
    date: .[0].date, 
    dateOriginal: .[0].dateOriginal, 
    hospitalizedCurrently:map(.hospitalizedCurrently) |add,
    inIcuCurrently:map(.inIcuCurrently) |add,
    inpatient_beds_capacity:map(.inpatient_beds_capacity) |add,
    inpatient_beds_used:map(.inpatient_beds_used) |add,
    adult_icu_beds_capacity:map(.adult_icu_beds_capacity) |add,
    adult_icu_bed_used:map(.adult_icu_bed_used) |add,
}) 