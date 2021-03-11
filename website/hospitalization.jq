[.[] | { 
    state:.state,
    date: (.date | gsub("-";"") |tonumber),
    dateOriginal:.date, 
    hospitalizedCurrently: .inpatient_beds_used_covid | (if ( . =="") then 0 else . end ) | tonumber,
    inIcuCurrently: .staffed_icu_adult_patients_confirmed_and_suspected_covid | (if ( . =="") then 0 else . end ) | tonumber,
    inpatient_beds_capacity: .inpatient_beds | (if ( . =="") then 0 else . end ) | tonumber,
    inpatient_beds_used: .inpatient_beds_used | (if ( . =="") then 0 else . end ) | tonumber,
    adult_icu_beds_capacity:.total_staffed_adult_icu_beds | (if ( . =="") then 0 else . end ) | tonumber,
    adult_icu_bed_used:.adult_icu_bed_utilization_numerator | (if ( . =="") then 0 else . end ) | tonumber,
}]