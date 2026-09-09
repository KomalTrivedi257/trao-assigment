const fs = require("fs");
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env")
});

const {
    generateInterviewKit
} = require("../services/kitGenerationService");


// Input and output files
const inputFile = process.argv[2];
const outputFile = process.argv[3];


// Check arguments
if (!inputFile || !outputFile) {
    console.error(
        "Usage: npm run evaluate -- cases.json kits.json"
    );
    process.exit(1);
}


// Main evaluation function
const run = async () => {
    try {

        const inputPath = path.resolve(inputFile);
        const outputPath = path.resolve(outputFile);


        // Check input file
        if (!fs.existsSync(inputPath)) {
            throw new Error(
                `Input file not found: ${inputFile}`
            );
        }


        // Read input file
        const inputData = fs.readFileSync(
            inputPath,
            "utf-8"
        );


        // Convert JSON
        let cases;

        try {
            cases = JSON.parse(inputData);
        } catch (error) {
            throw new Error(
                "Input file contains invalid JSON"
            );
        }


        // Input must be an array
        if (!Array.isArray(cases)) {
            throw new Error(
                "Input file must contain an array of cases"
            );
        }


        console.log(
            `Starting evaluation for ${cases.length} cases...`
        );


        const results = [];
        const processedCases = new Set();


        // Process each case
        for (const testCase of cases) {

            console.log(
                `\nProcessing case: ${testCase.id}`
            );


            const startedAt = new Date();


            try {

                // Validate required fields
                if (
                    !testCase.id ||
                    !testCase.jd ||
                    !testCase.company_url ||
                    !Number.isInteger(testCase.days)
                ) {
                    throw new Error(
                        "Case must contain id, jd, company_url and integer days"
                    );
                }


                // Validate JD
                if (!testCase.jd.trim()) {
                    throw new Error(
                        "JD cannot be empty"
                    );
                }


                // Validate days
                if (
                    testCase.days < 1 ||
                    testCase.days > 60
                ) {
                    throw new Error(
                        "Days must be between 1 and 60"
                    );
                }


                // Validate company URL
                let companyUrl;

                try {
                    companyUrl = new URL(
                        testCase.company_url.trim()
                    );
                } catch (error) {
                    throw new Error(
                        "Invalid company URL"
                    );
                }


                // Only HTTP/HTTPS URLs allowed
                if (
                    companyUrl.protocol !== "http:" &&
                    companyUrl.protocol !== "https:"
                ) {
                    throw new Error(
                        "Company URL must use http or https"
                    );
                }


                // Check duplicate JD + company
                const duplicateKey =
                    `${testCase.jd.trim().toLowerCase()}|${companyUrl.toString().toLowerCase()}`;


                if (processedCases.has(duplicateKey)) {
                    throw new Error(
                        "Duplicate JD and company URL"
                    );
                }


                processedCases.add(duplicateKey);


                console.log(
                    "Generating interview kit..."
                );


                // Generate kit using the same pipeline
                const kit =
                    await generateInterviewKit(
                        testCase.jd.trim(),
                        companyUrl.toString(),
                        testCase.days
                    );


                // Successful case
                results.push({
                    id: testCase.id,
                    status: "ok",
                    started_at:
                        startedAt.toISOString(),
                    completed_at:
                        new Date().toISOString(),
                    kit
                });


                console.log(
                    `Case ${testCase.id} completed successfully`
                );


            } catch (error) {

                // Failed case
                console.error(
                    `Case ${testCase.id} failed:`,
                    error.message
                );


                results.push({
                    id: testCase.id,
                    status: "failed",
                    started_at:
                        startedAt.toISOString(),
                    completed_at:
                        new Date().toISOString(),
                    error: error.message
                });

            }
        }


        // Final output
        const output = {
            version: "1.0",

            generated_at:
                new Date().toISOString(),

            total_cases:
                cases.length,

            successful:
                results.filter(
                    (item) => item.status === "ok"
                ).length,

            failed:
                results.filter(
                    (item) => item.status === "failed"
                ).length,

            results
        };


        // Write output JSON
        fs.writeFileSync(
            outputPath,
            JSON.stringify(output, null, 2)
        );


        console.log(
            "\nEvaluation completed."
        );

        console.log(
            `Successful: ${output.successful}`
        );

        console.log(
            `Failed: ${output.failed}`
        );

        console.log(
            `Output written to: ${outputPath}`
        );


    } catch (error) {

        console.error(
            "Evaluation failed:",
            error.message
        );

        process.exit(1);
    }
};


run();