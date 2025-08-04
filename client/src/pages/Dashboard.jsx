import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from 'react-query'
import { subjectAPI } from '../services/api'
import { 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Target, 
  Calendar,
  BarChart3,
  Play,
  Award
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
  const { user } = useAuth()

  // Fetch recommended subjects
  const { data: recommendedSubjects, isLoading: subjectsLoading } = useQuery(
    'recommendedSubjects',
    () => subjectAPI.getRecommendedSubjects(6),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Calculate user stats
  const stats = {
    totalQuestions: user?.progress?.totalQuestions || 0,
    correctAnswers: user?.progress?.correctAnswers || 0,
    accuracy: user?.progress?.totalQuestions > 0 
      ? Math.round((user.progress.correctAnswers / user.progress.totalQuestions) * 100)
      : 0,
    points: user?.progress?.points || 0,
    streakDays: user?.progress?.streakDays || 0,
    level: Math.floor((user?.progress?.points || 0) / 100) + 1
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
    >
      <div className={`p-2 rounded-lg ${color} w-fit mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  )

  const SubjectCard = ({ subject }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          style={{ backgroundColor: subject.color + '20' }}
        >
          {subject.icon}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
          <p className="text-sm text-gray-600">{subject.category}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">{subject.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {subject.activeTopicsCount || 0} topics
        </span>
        <button className="btn btn-primary btn-sm">
          <Play className="w-4 h-4 mr-1" />
          Start Learning
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-primary-100">
          Ready to continue your learning journey? You're doing great!
        </p>
        <div className="mt-6 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span className="text-sm">Level {stats.level}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-300" />
            <span className="text-sm">{stats.points} points</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-yellow-300" />
            <span className="text-sm">{stats.streakDays} day streak</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions}
          icon={BookOpen}
          color="bg-blue-500"
          subtitle="Questions attempted"
        />
        <StatCard
          title="Accuracy"
          value={`${stats.accuracy}%`}
          icon={Target}
          color="bg-green-500"
          subtitle="Correct answers"
        />
        <StatCard
          title="Points Earned"
          value={stats.points}
          icon={Trophy}
          color="bg-yellow-500"
          subtitle="Total points"
        />
        <StatCard
          title="Streak Days"
          value={stats.streakDays}
          icon={TrendingUp}
          color="bg-purple-500"
          subtitle="Consecutive days"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Start Practice"
            description="Begin a new practice session with AI-generated questions"
            icon={Play}
            color="bg-green-500"
            onClick={() => {/* Navigate to practice */}}
          />
          <QuickActionCard
            title="View Progress"
            description="Check your detailed progress and performance analytics"
            icon={BarChart3}
            color="bg-blue-500"
            onClick={() => {/* Navigate to progress */}}
          />
          <QuickActionCard
            title="Browse Subjects"
            description="Explore different subjects and topics to learn"
            icon={BookOpen}
            color="bg-purple-500"
            onClick={() => {/* Navigate to subjects */}}
          />
        </div>
      </div>

      {/* Recommended Subjects */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
        {subjectsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedSubjects?.data?.subjects?.map((subject) => (
              <SubjectCard key={subject._id} subject={subject} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {stats.totalQuestions > 0 ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Completed {stats.totalQuestions} questions
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Earned {stats.points} points
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Maintained {stats.streakDays} day streak
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No activity yet. Start learning to see your progress!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Goal Progress */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Goal</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Questions Today: {stats.totalQuestions % 10}/10
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((stats.totalQuestions % 10) / 10 * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((stats.totalQuestions % 10) / 10 * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Keep going! You're making great progress toward your daily goal.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 