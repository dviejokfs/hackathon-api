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
import {
  BigNumberProperty,
  ChainKey,
  ChainObject,
  DefaultError,
  NotFoundError,
  StringEnumProperty
} from "@gala-chain/api";
import BigNumber from "bignumber.js";
import { Exclude } from "class-transformer";
import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";

import { CourseStatus, Variety } from "./types";

export class AppleTree extends ChainObject {
  @Exclude()
  static INDEX_KEY = "GCAPPL";

  @ChainKey({ position: 0 })
  @IsString()
  public readonly plantedBy: string;

  @ChainKey({ position: 1 })
  @StringEnumProperty(Variety)
  public readonly variety: Variety;

  @ChainKey({ position: 2 })
  public readonly index: number;

  public readonly plantedAt: number;

  @BigNumberProperty()
  public applesPicked: BigNumber;

  constructor(plantedBy: string, variety: Variety, index: number, plantedAt: number) {
    super();
    this.plantedBy = plantedBy;
    this.variety = variety;
    this.index = index;
    this.plantedAt = plantedAt;
    this.applesPicked = new BigNumber(0);
  }

  public ageInYears(now: number): BigNumber {
    if (this.plantedAt > now) {
      throw new DefaultError("Tree planted in the future", { plantedAt: this.plantedAt, now });
    }

    return new BigNumber(now - this.plantedAt)
      .dividedBy(365 * 24 * 60 * 60 * 1000)
      .integerValue(BigNumber.ROUND_FLOOR);
  }

  public applesTotal(now: number): BigNumber {
    const ageInYears = this.ageInYears(now);
    if (ageInYears.isLessThan(1)) {
      return new BigNumber(0);
    }

    return new BigNumber(2).pow(ageInYears.minus(1));
  }

  public canPick(now: number): boolean {
    return this.applesPicked.isLessThan(this.applesTotal(now));
  }

  public ensureCanPick(now: number): { pick(): void } {
    if (!this.canPick(now)) {
      throw new NoApplesLeftError(this.applesPicked, this.applesTotal(now));
    }

    const pick = () => {
      this.applesPicked = this.applesPicked.plus(1);
    };

    return { pick };
  }
}

class NoApplesLeftError extends NotFoundError {
  constructor(total: BigNumber, picked: BigNumber) {
    super(`No apples left to pick. Total: ${total}, picked: ${picked}`);
  }
}

export class Course extends ChainObject {
  @Exclude()
  static INDEX_KEY = "CRS";

  @ChainKey({ position: 0 })
  @IsString()
  public Creator: string;

  @ChainKey({ position: 1 })
  @IsString()
  public readonly CourseID: string;

  @IsString()
  public Title: string;

  @IsString()
  public Description: string;

  @BigNumberProperty()
  public Price: BigNumber;

  @StringEnumProperty(CourseStatus)
  public Status: CourseStatus;

  constructor(
    CourseID: string,
    Creator: string,
    Title: string,
    Description: string,
    Price: BigNumber,
    Status: CourseStatus
  ) {
    super();
    this.CourseID = CourseID;
    this.Creator = Creator;
    this.Title = Title;
    this.Description = Description;
    this.Price = Price;
    this.Status = Status;
  }
}

export class Student extends ChainObject {
  @Exclude()
  static INDEX_KEY = "STU";

  @ChainKey({ position: 0 })
  @IsString()
  public readonly StudentID: string;

  @BigNumberProperty()
  public tokens: BigNumber;

  @IsArray()
  public EnrolledCourses: string[];

  @IsArray()
  public CompletedCourses: string[];

  constructor(StudentID: string, tokens: BigNumber, EnrolledCourses: string[], CompletedCourses: string[]) {
    super();
    this.StudentID = StudentID;
    this.tokens = tokens;
    this.EnrolledCourses = EnrolledCourses;
    this.CompletedCourses = CompletedCourses;
  }
}
export class StudentPurchase extends ChainObject {
  @Exclude()
  static INDEX_KEY = "STUP";

  @ChainKey({ position: 0 })
  @IsString()
  public StudentID: string;

  @ChainKey({ position: 1 })
  @IsString()
  public CourseID: string;

  @IsString()
  public PurchaseID: string;
  @IsString()
  public TXID: string;
  @IsString()
  public CreatorCourseID: string;
  @BigNumberProperty()
  public Timestamp: BigNumber;

  constructor(
    StudentID: string,
    CourseID: string,
    PurchaseID: string,
    TXID: string,
    CreatorCourseID: string,
    Timestamp: BigNumber
  ) {
    super();
    this.StudentID = StudentID;
    this.CourseID = CourseID;
    this.PurchaseID = PurchaseID;
    this.TXID = TXID;
    this.CreatorCourseID = CreatorCourseID;
    this.Timestamp = Timestamp;
  }
}

export class Chapter extends ChainObject {
  @Exclude()
  static INDEX_KEY = "CHAP";

  @ChainKey({ position: 0 })
  @IsString()
  public CourseID: string;

  @ChainKey({ position: 1 })
  @IsString()
  public readonly ChapterID: string;

  @IsString()
  public Title: string;

  constructor(ChapterID: string, CourseID: string, Title: string) {
    super();
    this.ChapterID = ChapterID;
    this.CourseID = CourseID;
    this.Title = Title;
  }
}

export class Lesson extends ChainObject {
  @Exclude()
  static INDEX_KEY = "LES";

  @ChainKey({ position: 0 })
  @IsString()
  public CourseID: string;

  @ChainKey({ position: 1 })
  @IsString()
  public ChapterID: string;

  @ChainKey({ position: 2 })
  @IsString()
  public readonly LessonID: string;

  @IsString()
  public Title: string;

  @IsString()
  public Description: string;

  @IsString()
  public IPFSCID: string;

  @IsOptional()
  public NFTClassKey: string;

  constructor(
    LessonID: string,
    ChapterID: string,
    CourseID: string,
    Title: string,
    Description: string,
    IPFSCID: string,
    NFTClassKey?: string
  ) {
    super();
    this.LessonID = LessonID;
    this.ChapterID = ChapterID;
    this.CourseID = CourseID;
    this.Title = Title;
    this.Description = Description;
    this.IPFSCID = IPFSCID;
    if (NFTClassKey) {
      this.NFTClassKey = NFTClassKey;
    }
  }
}
export class StudentNFT extends ChainObject {
  @Exclude()
  static INDEX_KEY = "STUNFT";

  @ChainKey({ position: 0 })
  @IsString()
  public StudentID: string;

  @ChainKey({ position: 1 })
  @IsString()
  public NFTClassKey: string;

  @IsString()
  public NFTInstanceID: string;
  @IsString()
  public CourseID: string;
  @IsString()
  public ChapterID: string;
  @IsString()
  public LessonID: string;
  constructor(
    StudentID: string,
    NFTClassKey: string,
    NFTInstanceID: string,
    CourseID: string,
    ChapterID: string,
    LessonID: string
  ) {
    super();
    this.StudentID = StudentID;
    this.NFTClassKey = NFTClassKey;
    this.NFTInstanceID = NFTInstanceID;
    this.CourseID = CourseID;
    this.ChapterID = ChapterID;
    this.LessonID = LessonID;
  }
}

export class Assignment extends ChainObject {
  @Exclude()
  static INDEX_KEY = "ASSGN";
  @ChainKey({ position: 0 })
  @IsString()
  public CourseID: string;

  @ChainKey({ position: 1 })
  @IsString()
  public LessonID: string;

  @ChainKey({ position: 2 })
  @IsString()
  public readonly SubmissionID: string;

  @IsString()
  public StudentID: string;

  public Timestamp: number;

  @IsString()
  public Grade: string;

  constructor(SubmissionID: string, CourseID: string, StudentID: string, Timestamp: number, Grade: string) {
    super();
    this.SubmissionID = SubmissionID;
    this.CourseID = CourseID;
    this.StudentID = StudentID;
    this.Timestamp = Timestamp;
    this.Grade = Grade;
  }
}

export class Certificate extends ChainObject {
  @Exclude()
  static INDEX_KEY = "CERT";

  @ChainKey({ position: 0 })
  @IsString()
  public readonly CertificateID: string;

  @IsString()
  public CourseID: string;

  @IsString()
  public StudentID: string;

  public IssueDate: number;

  constructor(CertificateID: string, CourseID: string, StudentID: string, IssueDate: number) {
    super();
    this.CertificateID = CertificateID;
    this.CourseID = CourseID;
    this.StudentID = StudentID;
    this.IssueDate = IssueDate;
  }
}
