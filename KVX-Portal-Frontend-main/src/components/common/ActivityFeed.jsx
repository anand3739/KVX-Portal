import { 
  Activity, 
  Users, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Award,
  FileText,
  Mail
} from "lucide-react";

const ActivityFeed = ({ activities, title = "Recent Activity", limit = 5 }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'user': return <Users className="h-4 w-4" />;
      case 'job': return <Briefcase className="h-4 w-4" />;
      case 'time': return <Clock className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'alert': return <AlertCircle className="h-4 w-4" />;
      case 'award': return <Award className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'mail': return <Mail className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getIconColor = (type) => {
    switch(type) {
      case 'user': return 'bg-blue-100 text-blue-600';
      case 'job': return 'bg-purple-100 text-purple-600';
      case 'time': return 'bg-yellow-100 text-yellow-600';
      case 'success': return 'bg-green-100 text-green-600';
      case 'alert': return 'bg-red-100 text-red-600';
      case 'award': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {(activities || []).slice(0, limit).map((activity, index) => (
          <div key={activity.id || index} className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${getIconColor(activity.type)}`}>
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.user}</p>
              <p className="text-sm text-gray-500 truncate">{activity.action}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
            {activity.status && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium
                ${activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                  activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'}`}>
                {activity.status}
              </span>
            )}
          </div>
        ))}
        
        {(activities || []).length === 0 && (
          <p className="text-center text-gray-500 py-4">No recent activities</p>
        )}
      </div>
      
      {(activities || []).length > limit && (
        <button className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All Activity
        </button>
      )}
    </div>
  );
};

export default ActivityFeed;