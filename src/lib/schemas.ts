import { z } from 'zod';

export const ExperienceEntrySchema = z.object({
  employer: z.string(),
  title: z.string(),
  years: z.coerce.number().min(0),
  description: z.string(),
});

export const EducationEntrySchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
});

export const ProjectEntrySchema = z.object({
  name: z.string(),
  technologies: z.array(z.string()),
  description: z.string(),
});

export const ExtractedProfileSchema = z.object({
  name: z.string(),
  skills: z.array(z.string()),
  experience: z.array(ExperienceEntrySchema),
  education: z.array(EducationEntrySchema),
  projects: z.array(ProjectEntrySchema),
});

// Export inferred TypeScript types alongside schemas
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type EducationEntry = z.infer<typeof EducationEntrySchema>;
export type ProjectEntry = z.infer<typeof ProjectEntrySchema>;
export type ExtractedProfile = z.infer<typeof ExtractedProfileSchema>;
