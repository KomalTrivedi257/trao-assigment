const checkCoverage = (requirements, questions) => {
    const coveredRequirementIds = new Set();

    for (const question of questions) {
        for (const requirementId of question.requirement_ids || []) {
            coveredRequirementIds.add(requirementId);
        }
    }

    const uncoveredRequirementIds = [];

    for (const requirement of requirements) {
        if (!coveredRequirementIds.has(requirement.id)) {
            uncoveredRequirementIds.push(requirement.id);
        }
    }

    return {
        covered_requirement_ids: [...coveredRequirementIds],
        uncovered_requirement_ids: uncoveredRequirementIds
    };
};

module.exports = {
    checkCoverage
};