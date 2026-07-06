import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  X,
  Search,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  MapPin,
  Trophy,
} from "lucide-react";
import {
  classStudentPerformance,
  RANK_STYLES,
  type StudentPerformance,
} from "@/lib/mock-data";

interface ClassInfo {
  name: string;
  section: string;
  subject: string;
  totalStudents: number;
  classTeacher: string;
  timings: string;
  room: string;
}

type SortField =
  | "name"
  | "rollNumber"
  | "rank"
  | "attendance"
  | "assignmentAverage"
  | "midtermMarks";

type FilterOption = "all" | "top" | "atRisk";

function getRankDisplay(rank: number) {
  if (rank <= 3) {
    const style = RANK_STYLES[rank - 1];
    return (
      <span className={`inline-flex items-center gap-1 font-semibold ${style.text}`}>
        <span>{style.icon}</span>
        <span className={`${style.bg} text-xs px-1.5 py-0.5 rounded-full`}>
          {style.label}
        </span>
      </span>
    );
  }
  return <span className="text-muted-foreground text-sm">Rank {rank}</span>;
}

function getMidtermDisplay(student: StudentPerformance) {
  if (!student.midterm) {
    return <span className="text-muted-foreground">N/A</span>;
  }
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium">
        {student.midterm.marksObtained}/{student.midterm.totalMarks}
      </span>
      <span className="text-xs text-muted-foreground">
        {student.midterm.percentage}% · {student.midterm.grade}
      </span>
    </div>
  );
}

function getProgressColor(value: number) {
  if (value >= 80) return "bg-green-500";
  if (value >= 60) return "bg-amber-500";
  return "bg-red-500";
}

interface ClassDetailSectionProps {
  classInfo: ClassInfo;
  onClose: () => void;
}

export function ClassDetailSection({ classInfo, onClose }: ClassDetailSectionProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("rank");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  const students = classStudentPerformance[classInfo.name] || [];

  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q)
      );
    }

    if (filterBy === "top") {
      result = result.filter((s) => s.assignmentRank <= 3);
    } else if (filterBy === "atRisk") {
      result = result.filter((s) => s.overallProgress < 60);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "rollNumber":
          return a.rollNumber.localeCompare(b.rollNumber);
        case "rank":
          return a.assignmentRank - b.assignmentRank;
        case "attendance":
          return b.attendancePercentage - a.attendancePercentage;
        case "assignmentAverage":
          return b.assignmentAverage - a.assignmentAverage;
        case "midtermMarks":
          const aM = a.midterm?.marksObtained ?? -1;
          const bM = b.midterm?.marksObtained ?? -1;
          return bM - aM;
        default:
          return 0;
      }
    });

    return result;
  }, [students, search, sortBy, filterBy]);

  return (
    <div className="space-y-4 mt-6">
      <Card className="border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">
                  {classInfo.name}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  Section {classInfo.section}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{classInfo.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{classInfo.totalStudents} Students</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{classInfo.classTeacher}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{classInfo.timings}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Room {classInfo.room}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortField)}
          >
            <SelectTrigger size="sm" className="w-full sm:w-36">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="rollNumber">Roll Number</SelectItem>
              <SelectItem value="rank">Rank</SelectItem>
              <SelectItem value="attendance">Attendance</SelectItem>
              <SelectItem value="assignmentAverage">Assignment Marks</SelectItem>
              <SelectItem value="midtermMarks">Midterm Marks</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterBy}
            onValueChange={(v) => setFilterBy(v as FilterOption)}
          >
            <SelectTrigger size="sm" className="w-full sm:w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="top">Top Performers</SelectItem>
              <SelectItem value="atRisk">At Risk Students</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Roll No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead className="w-24">Attendance</TableHead>
                <TableHead className="w-24">Assignment Avg</TableHead>
                <TableHead className="w-24">Rank</TableHead>
                <TableHead className="w-28">Midterm</TableHead>
                <TableHead className="w-48">Overall Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-xs">
                      {student.rollNumber.slice(-4)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          <AvatarFallback className="text-xs">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                          {student.attendancePercentage}%
                        </span>
                        <Progress
                          value={student.attendancePercentage}
                          className="h-1.5 w-16"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {student.assignmentAverage}
                      </span>
                      <span className="text-muted-foreground">/100</span>
                    </TableCell>
                    <TableCell>{getRankDisplay(student.assignmentRank)}</TableCell>
                    <TableCell>{getMidtermDisplay(student)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Progress
                            value={student.overallProgress}
                            className={`h-2 ${getProgressColor(student.overallProgress)}`}
                          />
                        </div>
                        <span className="text-sm font-medium w-10 text-right">
                          {student.overallProgress}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {filteredStudents.length} of {students.length} students
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            High (≥80%)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Medium (60-79%)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Low (&lt;60%)
          </span>
        </div>
      </div>
    </div>
  );
}
