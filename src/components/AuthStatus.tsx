import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, User, Shield, Database } from 'lucide-react';
import { useAuth } from '../utils/auth';

export function AuthStatus() {
  const { user, loading } = useAuth();

  return (
    <Card className="p-6">
      <h3 className="text-[#2D6A4F] mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5" />
        Authentication Status
      </h3>

      <div className="space-y-4">
        {/* Auth State */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {user ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="text-sm text-gray-700">Login Status</p>
              <p className="text-xs text-gray-500">
                {loading ? 'Checking...' : user ? 'Logged in' : 'Not logged in'}
              </p>
            </div>
          </div>
          {user ? (
            <Badge className="bg-green-500 text-white hover:bg-green-500">Active</Badge>
          ) : (
            <Badge className="bg-gray-400 text-white hover:bg-gray-400">Inactive</Badge>
          )}
        </div>

        {/* User Info */}
        {user && (
          <>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-700">User Email</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-700">Session Persistence</p>
                  <p className="text-xs text-gray-500">Active (stays logged in)</p>
                </div>
              </div>
              <Badge className="bg-purple-500 text-white hover:bg-purple-500">Enabled</Badge>
            </div>
          </>
        )}

        {/* Features */}
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-600 mb-3">✨ Enabled Features:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Auto-login</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Token refresh</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Protected routes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Anti-duplicate</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
