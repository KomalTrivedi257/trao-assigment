const createSchedule = (
    requirements,
    questions,
    daysAvailable
) => {

    if (!Number.isInteger(daysAvailable) || daysAvailable < 1) {
        throw new Error("Days available must be at least 1");
    }

    if (!Array.isArray(requirements)) {
        throw new Error("Requirements must be an array");
    }

    if (!Array.isArray(questions)) {
        throw new Error("Questions must be an array");
    }


    // Create exactly the requested number of days
    const days = [];

    for (let i = 1; i <= daysAvailable; i++) {
        days.push({
            day: i,
            focus: "",
            question_ids: [],
            minutes: 0
        });
    }


    /*
        Find at least one question for every
        must-have requirement.
    */

    const mustHaveQuestionIds = new Set();

    for (const requirement of requirements) {

        if (requirement.priority !== "must") {
            continue;
        }

        const question = questions.find((q) =>
            q.requirement_ids?.includes(requirement.id)
        );

        if (question) {
            mustHaveQuestionIds.add(question.id);
        }
    }


    /*
        Sort questions.

        Priority:
        1. Must-have requirement
        2. Higher difficulty
    */

    const sortedQuestions = [...questions].sort((a, b) => {

        const aMust = mustHaveQuestionIds.has(a.id);
        const bMust = mustHaveQuestionIds.has(b.id);

        if (aMust !== bMust) {
            return aMust ? -1 : 1;
        }

        return (b.difficulty || 1) - (a.difficulty || 1);
    });


    /*
        If only one day is available,
        put every question on Day 1.
    */

    if (daysAvailable === 1) {

        for (const question of sortedQuestions) {

            days[0].question_ids.push(question.id);

            days[0].minutes += 15;
        }

    } else {

        /*
            First schedule one important question
            on each available day.

            This helps spread must-have preparation
            across the available days.
        */

        const priorityQuestions = sortedQuestions.filter(
            (question) =>
                mustHaveQuestionIds.has(question.id)
        );


        const remainingQuestions = sortedQuestions.filter(
            (question) =>
                !mustHaveQuestionIds.has(question.id)
        );


        /*
            Distribute must-have questions first.
        */

        priorityQuestions.forEach((question, index) => {

            const dayIndex = index % daysAvailable;

            days[dayIndex].question_ids.push(
                question.id
            );

            days[dayIndex].minutes += 15;
        });


        /*
            Distribute remaining questions.
        */

        remainingQuestions.forEach((question, index) => {

            const dayIndex = index % daysAvailable;

            days[dayIndex].question_ids.push(
                question.id
            );

            days[dayIndex].minutes += 15;
        });
    }


    /*
        Create focus for every day.
    */

    days.forEach((day) => {

        const categories = day.question_ids
            .map((questionId) => {

                const question = questions.find(
                    (q) => q.id === questionId
                );

                return question?.category;
            })
            .filter(Boolean);


        const uniqueCategories = [
            ...new Set(categories)
        ];


        day.focus = uniqueCategories.join(" + ");
    });


    return {
        days_available: daysAvailable,
        days
    };
};


module.exports = {
    createSchedule
};