/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ChainCallDTO, StringEnumProperty, TokenClass } from "@gala-chain/api";
import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested
} from "class-validator";

import { AppleTree, Chapter, Course, Lesson, StudentNFT, StudentPurchase } from "./AppleTree";
import { CourseStatus, Variety } from "./types";

export class AppleTreeDto extends ChainCallDTO {
  @StringEnumProperty(Variety)
  public readonly variety: Variety;

  public readonly index: number;

  constructor(variety: Variety, index: number) {
    super();
    this.variety = variety;
    this.index = index;
  }
}

export class AppleTreesDto extends ChainCallDTO {
  @ValidateNested({ each: true })
  @Type(() => AppleTreeDto)
  @ArrayNotEmpty()
  public readonly trees: AppleTreeDto[];

  constructor(trees: AppleTreeDto[]) {
    super();
    this.trees = trees;
  }
}
export class CreateCourseDto extends ChainCallDTO {
  @IsString()
  public readonly courseId: string;
  @IsString()
  public readonly title: string;
  @IsString()
  public readonly description: string;
  public readonly price: number;

  @StringEnumProperty(CourseStatus)
  public readonly status: CourseStatus;
  constructor(courseId: string, title: string, description: string, price: number, status: CourseStatus) {
    super();
    this.courseId = courseId;
    this.title = title;
    this.description = description;
    this.price = price;
    this.status = status;
  }
}
export class FetchCreatedCoursesDto extends ChainCallDTO {
  @IsString()
  @IsOptional()
  public readonly bookmark?: string;

  @IsOptional()
  public readonly limit?: number;

  constructor(bookmark?: string, limit?: number) {
    super();
    this.bookmark = bookmark;
    this.limit = limit;
  }
}

export class FetchEnrolledCoursesDto extends ChainCallDTO {
  @IsString()
  @IsOptional()
  public readonly bookmark?: string;

  @IsOptional()
  public readonly limit?: number;

  constructor(bookmark?: string, limit?: number) {
    super();
    this.bookmark = bookmark;
    this.limit = limit;
  }
}
export class AddBalanceToStudentDto extends ChainCallDTO {
  public readonly amount: number;

  constructor(amount: number) {
    super();
    this.amount = amount;
  }
}
export class FetchPurchasedCoursesDto extends ChainCallDTO {
  @IsString()
  @IsOptional()
  public readonly bookmark?: string;

  @IsOptional()
  public readonly limit?: number;

  constructor(bookmark?: string, limit?: number) {
    super();
    this.bookmark = bookmark;
    this.limit = limit;
  }
}

export class PickAppleDto extends ChainCallDTO {
  @IsString()
  public readonly PlantedBy: string;

  @StringEnumProperty(Variety)
  public readonly variety: Variety;

  public readonly index: number;

  constructor(treePlantedBy: string, variety: Variety, index: number) {
    super();
    this.PlantedBy = treePlantedBy;
    this.variety = variety;
    this.index = index;
  }
}

export class FetchCoursesDto extends ChainCallDTO {
  @IsString()
  @ValidateIf((o) => o.creator !== undefined)
  public readonly creator?: string;

  @IsString()
  @IsOptional()
  public readonly bookmark?: string;

  @IsOptional()
  public readonly limit?: number;

  constructor(creator?: string, bookmark?: string, limit?: number) {
    super();
    this.creator = creator;
    this.bookmark = bookmark;
    this.limit = limit;
  }
}
export class FetchBalanceOfStudentDto extends ChainCallDTO {
  constructor() {
    super();
  }
}

export class PagedCoursesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Course)
  public readonly courses: Course[];

  @IsString()
  public readonly bookmark: string;

  constructor(courses: Course[], bookmark: string) {
    this.courses = courses;
    this.bookmark = bookmark;
  }
}
export class StudentPurchaseWithCourseDto extends ChainCallDTO {
  public readonly Course: Course;
  public readonly StudentPurchase: StudentPurchase;
  constructor(Course: Course, StudentPurchase: StudentPurchase) {
    super();
    this.Course = Course;
    this.StudentPurchase = StudentPurchase;
  }
}
export class PagedStudentPurchaseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentPurchase)
  public readonly purchases: StudentPurchaseWithCourseDto[];

  @IsString()
  public readonly bookmark: string;

  constructor(purchases: StudentPurchaseWithCourseDto[], bookmark: string) {
    this.purchases = purchases;
    this.bookmark = bookmark;
  }
}

export class GetStudentNFTsDto extends ChainCallDTO {
  @IsString()
  @IsOptional()
  public readonly bookmark?: string;

  @IsOptional()
  public readonly limit?: number;

  constructor(bookmark?: string, limit?: number) {
    super();
    this.bookmark = bookmark;
    this.limit = limit;
  }
}

export class StudentNFTWithTokenDto extends ChainCallDTO {
  public readonly StudentNFT: StudentNFT;
  public readonly Token: TokenClass;

  constructor(StudentNFT: StudentNFT, Token: TokenClass) {
    super();
    this.StudentNFT = StudentNFT;
    this.Token = Token;
  }
}

export class PagedStudentNFTDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentNFTWithTokenDto)
  public readonly nfts: StudentNFTWithTokenDto[];

  @IsString()
  public readonly bookmark: string;

  constructor(nfts: StudentNFTWithTokenDto[], bookmark: string) {
    this.nfts = nfts;
    this.bookmark = bookmark;
  }
}

export class StudentBalanceDto extends ChainCallDTO {
  public readonly balance: number;

  constructor(balance: number) {
    super();
    this.balance = balance;
  }
}

export class FetchTreesDto extends ChainCallDTO {
  @IsString()
  @ValidateIf((o) => o.plantedBy !== undefined || o.variety !== undefined)
  public readonly plantedBy?: string;

  @IsIn(Object.keys(Variety))
  @ValidateIf((o) => o.variety !== undefined || o.index !== undefined)
  public readonly variety?: Variety;

  @IsOptional()
  public readonly index?: number;

  @IsString()
  @IsOptional()
  public readonly bookmark?: string;

  @IsOptional()
  public readonly limit?: number;

  constructor(plantedBy?: string, variety?: Variety, index?: number, bookmark?: string, limit?: number) {
    super();
    this.plantedBy = plantedBy;
    this.variety = variety;
    this.index = index;
    this.bookmark = bookmark;
    this.limit = limit;
  }
}

export class PagedTreesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppleTree)
  public readonly trees: AppleTree[];

  @IsString()
  public readonly bookmark: string;

  constructor(trees: AppleTree[], bookmark: string) {
    this.trees = trees;
    this.bookmark = bookmark;
  }
}

export class EnrollInCourseDto extends ChainCallDTO {
  @IsString()
  public readonly courseId: string;
  @IsString()
  public readonly creator: string;

  constructor(creator: string, courseId: string) {
    super();
    this.creator = creator;
    this.courseId = courseId;
  }
}

export class FetchMyCourseDto extends ChainCallDTO {
  @IsString()
  public readonly courseId: string;

  constructor(courseId: string) {
    super();
    this.courseId = courseId;
  }
}
export class LessonDto extends ChainCallDTO {
  public readonly Lesson: Lesson;
  constructor(Lesson: Lesson) {
    super();
    this.Lesson = Lesson;
  }
}
export class ChapterDto extends ChainCallDTO {
  public readonly Chapter: Chapter;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonDto)
  public readonly Lessons: LessonDto[];

  constructor(Chapter: Chapter, Lessons: LessonDto[]) {
    super();
    this.Chapter = Chapter;
    this.Lessons = Lessons;
  }
}

export class CompleteLessonDto extends ChainCallDTO {
  @IsString()
  public readonly courseId: string;

  @IsString()
  public readonly creator: string;

  @IsString()
  public readonly chapterId: string;

  @IsString()
  public readonly lessonId: string;

  constructor(courseId: string, creator: string, chapterId: string, lessonId: string) {
    super();
    this.courseId = courseId;
    this.creator = creator;
    this.chapterId = chapterId;
    this.lessonId = lessonId;
  }
}

export class CreateNFTForLessonDto extends ChainCallDTO {
  @IsString()
  public readonly courseId: string;

  @IsString()
  public readonly chapterId: string;

  @IsString()
  public readonly lessonId: string;

  @IsString()
  public readonly NFTCollectionName: string;
  @IsString()
  public readonly NFTCategory: string;
  @IsString()
  public readonly NFTType: string;
  @IsString()
  public readonly NFTAdditionalKey: string;
  @IsString()
  public readonly NFTSymbol: string;
  @IsString()
  public readonly NFTDescription: string;
  @IsString()
  public readonly NFTImage: string;
  @IsNumber()
  public readonly NFTMaxSupply: number;

  constructor(
    courseId: string,
    chapterId: string,
    lessonId: string,
    NFTCollectionName: string,
    NFTCategory: string,
    NFTType: string,
    NFTAdditionalKey: string,
    NFTSymbol: string,
    NFTDescription: string,
    NFTImage: string,
    NFTMaxSupply: number
  ) {
    super();
    this.courseId = courseId;
    this.chapterId = chapterId;
    this.lessonId = lessonId;
    this.NFTCollectionName = NFTCollectionName;
    this.NFTCategory = NFTCategory;
    this.NFTType = NFTType;
    this.NFTAdditionalKey = NFTAdditionalKey;
    this.NFTSymbol = NFTSymbol;
    this.NFTDescription = NFTDescription;
    this.NFTImage = NFTImage;
    this.NFTMaxSupply = NFTMaxSupply;
  }
}

export class FetchLessonDto extends ChainCallDTO {
  @IsString()
  public readonly courseId: string;

  @IsString()
  public readonly chapterId: string;

  @IsString()
  public readonly lessonId: string;

  constructor(courseId: string, chapterId: string, lessonId: string) {
    super();
    this.courseId = courseId;
    this.chapterId = chapterId;
    this.lessonId = lessonId;
  }
}
export class CourseDto extends ChainCallDTO {
  public readonly Course: Course;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChapterDto)
  public readonly Chapters: ChapterDto[];

  constructor(Course: Course, Chapters: ChapterDto[]) {
    super();
    this.Course = Course;
    this.Chapters = Chapters;
  }
}

export class FetchCourseDto extends ChainCallDTO {
  @IsString()
  public readonly courseId: string;
  @IsString()
  public readonly creator: string;

  constructor(creator: string, courseId: string) {
    super();
    this.courseId = courseId;
    this.creator = creator;
  }
}
export class UpdateCourseDto extends ChainCallDTO {
  @IsString()
  public readonly courseId: string;
  @IsString()
  public readonly title: string;
  @IsString()
  public readonly description: string;
  public readonly price: number;

  @StringEnumProperty(CourseStatus)
  public readonly status: CourseStatus;
  constructor(courseId: string, title: string, description: string, price: number, status: CourseStatus) {
    super();
    this.courseId = courseId;
    this.title = title;
    this.description = description;
    this.price = price;
    this.status = status;
  }
}

export class UpdateLessonDto extends ChainCallDTO {
  @IsString()
  public readonly courseId: string;

  @IsString()
  public readonly chapterId: string;

  @IsString()
  public readonly lessonId: string;

  @IsString()
  public readonly title: string;
  @IsString()
  public readonly ipfsCID: string;

  constructor(courseId: string, chapterId: string, lessonId: string, title: string, ipfsCID: string) {
    super();
    this.courseId = courseId;
    this.chapterId = chapterId;
    this.lessonId = lessonId;
    this.title = title;
    this.ipfsCID = ipfsCID;
  }
}
export class UpdateChapterDto extends ChainCallDTO {
  @IsString()
  public readonly courseId: string;

  @IsString()
  public readonly chapterId: string;

  @IsString()
  public readonly title: string;

  constructor(courseId: string, chapterId: string, title: string) {
    super();
    this.courseId = courseId;
    this.chapterId = chapterId;
    this.title = title;
  }
}

export class CreateChapterDto extends ChainCallDTO {
  @IsString()
  public readonly courseId: string;

  @IsString()
  public readonly chapterId: string;

  @IsString()
  public readonly title: string;

  constructor(courseId: string, chapterId: string, title: string) {
    super();
    this.courseId = courseId;
    this.chapterId = chapterId;
    this.title = title;
  }
}

export class CreateLessonDto extends ChainCallDTO {
  @IsString()
  public readonly courseId: string;

  @IsString()
  public readonly chapterId: string;

  @IsString()
  public readonly lessonId: string;

  @IsString()
  public readonly title: string;

  @IsString()
  public readonly ipfsCID: string;

  constructor(courseId: string, chapterId: string, lessonId: string, title: string, ipfsCID: string) {
    super();
    this.courseId = courseId;
    this.chapterId = chapterId;
    this.lessonId = lessonId;
    this.title = title;
    this.ipfsCID = ipfsCID;
  }
}
