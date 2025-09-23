import { supabase } from "../utils/supabaseClient";

export interface UserActivity {
  id: string;
  user_id: string;
  timestamp: string;
  activity_id: string;
  context?: any; // JSONB field for additional context data
  log?: string;
}

export interface CreateUserActivityParams {
  activity_id: string;
  context?: any;
  log?: string;
  user_id?: string; // Optional, will use auth.uid() if not provided
}

export interface UpdateUserActivityParams {
  id: string;
  activity_id?: string;
  context?: any;
  log?: string;
}

export interface ListUserActivitiesParams {
  userId?: string;
  activityId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface UserActivityStats {
  total: number;
  byActivityId: Record<string, number>;
  byDate: Record<string, number>;
}

// Create a new user activity
export async function createUserActivity(
  params: CreateUserActivityParams
): Promise<UserActivity> {
  const { data, error } = await supabase
    .from("user_activity")
    .insert([
      {
        activity_id: params.activity_id,
        context: params.context || null,
        log: params.log || null,
        user_id: params.user_id || undefined, // Let RLS handle auth.uid() if not provided
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get a single user activity by id
export async function getUserActivity(id: string): Promise<UserActivity> {
  const { data, error } = await supabase
    .from("user_activity")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Update a user activity
export async function updateUserActivity(
  params: UpdateUserActivityParams
): Promise<UserActivity> {
  const updateData: Partial<UserActivity> = {};

  if (params.activity_id !== undefined)
    updateData.activity_id = params.activity_id;
  if (params.context !== undefined) updateData.context = params.context;
  if (params.log !== undefined) updateData.log = params.log;

  const { data, error } = await supabase
    .from("user_activity")
    .update(updateData)
    .eq("id", params.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a user activity
export async function deleteUserActivity(id: string): Promise<void> {
  const { error } = await supabase.from("user_activity").delete().eq("id", id);

  if (error) throw error;
}

// List user activities with optional filters
export async function listUserActivities(
  params: ListUserActivitiesParams = {}
): Promise<UserActivity[]> {
  let query = supabase
    .from("user_activity")
    .select("*")
    .order("timestamp", { ascending: false });

  if (params.userId) {
    query = query.eq("user_id", params.userId);
  }

  if (params.activityId) {
    query = query.eq("activity_id", params.activityId);
  }

  if (params.startDate) {
    query = query.gte("timestamp", params.startDate);
  }

  if (params.endDate) {
    query = query.lte("timestamp", params.endDate);
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.offset) {
    query = query.range(
      params.offset,
      params.offset + (params.limit || 50) - 1
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Get user activities by activity ID
export async function getUserActivitiesByActivityId(
  activityId: string,
  userId?: string
): Promise<UserActivity[]> {
  const params: ListUserActivitiesParams = {
    activityId,
    userId,
  };
  return listUserActivities(params);
}

// Get recent user activities
export async function getRecentUserActivities(
  userId?: string,
  limit: number = 50
): Promise<UserActivity[]> {
  const params: ListUserActivitiesParams = {
    userId,
    limit,
  };
  return listUserActivities(params);
}

// Get user activity statistics
export async function getUserActivityStats(
  userId?: string,
  startDate?: string,
  endDate?: string
): Promise<UserActivityStats> {
  let query = supabase.from("user_activity").select("activity_id, timestamp");

  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (startDate) {
    query = query.gte("timestamp", startDate);
  }

  if (endDate) {
    query = query.lte("timestamp", endDate);
  }

  const { data, error } = await query;

  if (error) throw error;

  const activities = data || [];
  const byActivityId: Record<string, number> = {};
  const byDate: Record<string, number> = {};

  activities.forEach((activity) => {
    // Count by activity ID
    byActivityId[activity.activity_id] =
      (byActivityId[activity.activity_id] || 0) + 1;

    // Count by date (YYYY-MM-DD format)
    const date = new Date(activity.timestamp).toISOString().split("T")[0];
    byDate[date] = (byDate[date] || 0) + 1;
  });

  return {
    total: activities.length,
    byActivityId,
    byDate,
  };
}

// Log a simple activity (convenience function)
export async function logActivity(
  activityId: string,
  log?: string,
  context?: any
): Promise<UserActivity> {
  return createUserActivity({
    activity_id: activityId,
    log,
    context,
  });
}

// Log YouTube video interactions
export async function logYouTubeActivity(
  activityId: string,
  videoId: string,
  timestamp?: number,
  context?: any
): Promise<UserActivity> {
  return createUserActivity({
    activity_id: activityId,
    context: {
      video_id: videoId,
      timestamp,
      ...context,
    },
    log: `YouTube ${activityId} - Video: ${videoId}${timestamp ? ` at ${timestamp}s` : ""}`,
  });
}

// Log document interactions
export async function logDocumentActivity(
  activityId: string,
  documentId: string,
  context?: any
): Promise<UserActivity> {
  return createUserActivity({
    activity_id: activityId,
    context: {
      document_id: documentId,
      ...context,
    },
    log: `Document ${activityId} - ID: ${documentId}`,
  });
}

// Log annotation interactions
export async function logAnnotationActivity(
  activityId: string,
  annotationId: string,
  context?: any
): Promise<UserActivity> {
  return createUserActivity({
    activity_id: activityId,
    context: {
      annotation_id: annotationId,
      ...context,
    },
    log: `Annotation ${activityId} - ID: ${annotationId}`,
  });
}

// Delete old activities (cleanup function)
export async function deleteOldActivities(
  olderThanDays: number = 30,
  userId?: string
): Promise<{ deletedCount: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  let query = supabase
    .from("user_activity")
    .delete()
    .lt("timestamp", cutoffDate.toISOString());

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { error } = await query;

  if (error) throw error;

  // Note: Supabase doesn't return count of deleted rows directly
  // This would need to be handled differently in a real implementation
  return { deletedCount: 0 };
}

// Get activity timeline (activities grouped by day)
export async function getActivityTimeline(
  userId?: string,
  days: number = 30
): Promise<Record<string, UserActivity[]>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const activities = await listUserActivities({
    userId,
    startDate: startDate.toISOString(),
  });

  // Group activities by date
  const timeline: Record<string, UserActivity[]> = {};

  activities.forEach((activity) => {
    const date = new Date(activity.timestamp).toISOString().split("T")[0];
    if (!timeline[date]) {
      timeline[date] = [];
    }
    timeline[date].push(activity);
  });

  return timeline;
}

// Search activities by log content
export async function searchUserActivities(
  searchTerm: string,
  userId?: string,
  limit: number = 50
): Promise<UserActivity[]> {
  if (!searchTerm.trim()) {
    return [];
  }

  let query = supabase
    .from("user_activity")
    .select("*")
    .ilike("log", `%${searchTerm}%`)
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error searching user activities:", error);
    throw error;
  }

  return data || [];
}
