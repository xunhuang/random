[
    [.[] |
if (.overall_outcome == "Positive") then . + {
total_positive: .total_results_reported | tonumber,
new_positive:.new_results_reported |tonumber 
}
elif (.overall_outcome == "Negative") then . + {
total_negative: .total_results_reported |tonumber,
new_negative:.new_results_reported  |tonumber,
}
elif (.overall_outcome == "Inconclusive") then . + 
{
total_inconclusive: .total_results_reported |tonumber,
new_inconclusive:.new_results_reported  |tonumber,
}
else "xxx" end ]  | group_by (.state_fips, .date) []  | 
{
    date: .[0].date,
    state: .[0].state,
    state_name: .[0].state_name,
    state_fips: .[0].state_fips,
    positive: max_by(.total_positive) |.total_positive, 
    negative: max_by(.total_negative) |.total_negative,
    inconclusive: max_by(.total_inconclusive) |.total_inconclusive,
    positiveIncrease: max_by(.new_positive) |.new_positive, 
    negativeIncrease: max_by(.new_negative) |.new_negative,
    inconclusiveIncrease: max_by(.new_inconclusive) |.new_inconclusive
}  | .  + { 
    totalTestResults: (.positive+ .negative + .inconclusive),
    totalTestResultsIncrease: (.positiveIncrease+ .negativeIncrease + .inconclusiveIncrease)
    } 
    ]