import { sketchService } from '@/api/sketch-service'
import { ActionItem } from '@/lib/action-items'
import { useQuery } from '@tanstack/react-query'

export const useActionItems = () => {
  const { data: actionItems, isLoading, error } = useQuery<ActionItem[]>({
    queryKey: ['actionItems'],
    queryFn: () => sketchService.types(),
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on component mount if data exists
    retry: false, // Disable retries to avoid HTTP fallback
    staleTime: Infinity // Cache forever to avoid refetches
  })
  
  if (error) {
    console.error('[useActionItems] Error fetching action items:', error)
  }
  
  return {
    actionItems,
    isLoading
  }
}
