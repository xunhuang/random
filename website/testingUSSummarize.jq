
group_by(.date) | map({
    "date": .[0].date, 
    positive: map(.positive) | add,
    negative:map(.negative) |add,
    inconclusive:map(.inconclusive) |add,
    positiveIncrease:map(.positiveIncrease) |add,
    negativeIncrease:map(.negativeIncrease) |add,
    inconclusiveIncrease:map(.inconclusive) |add,
    totalTestResults:map(.totalTestResults) |add,
    totalTestResultsIncrease:map(.totalTestResultsIncrease) |add,
}) 