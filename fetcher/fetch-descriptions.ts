import { getCourseDescription } from "@/banner/description.ts";
import { Course, Subject } from "@/banner/types.ts";
import { FOLDER_PATH } from "@/fetcher/constants.ts";
import { readJSON, writeJSON } from "@/util/file.ts";

const subjects = await readJSON<Subject[]>(`${FOLDER_PATH}/subjects.json`);
// const subjects = [{ code: "CS" }];

const noSubjects = subjects?.length;
for await (const [index, subject] of subjects!.entries()) {
  const courses = await readJSON<Course[]>(
    `${FOLDER_PATH}/courses/${subject.code}.json`
  );

  const noCourses = courses?.length;
  for await (const [courseIndex, course] of courses!.entries()) {
    /* 
    - Different sections (Like accelerated vs regular fundies) may have different descriptions 
    - Start fetching descriptions of sections, and if two are the same, use that
    - Accelerated section descriptions are not very informative, so use the default section description
    TODO: what if the first two courses are both accelerated and the description is the same?
    */

    const sectionDescriptions: string[] = [];

    for (const section of course.sections) {
      const description = await getCourseDescription(section.term, section.crn);

      if (sectionDescriptions.includes(description)) {
        course.description = description;
        break;
      }

      sectionDescriptions.push(description);
    }

    console.log(
      `${index + 1}/${noSubjects} : ${
        courseIndex + 1
      }/${noCourses} courses done`
    );
  }

  writeJSON(`${FOLDER_PATH}/courses/${subject.code}.json`, courses);

  console.log(`${index + 1}/${noSubjects} ${subject.code} done`);
}
