import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/AuthContext";
import { getUserDocuSignConnections } from "@/lib/docusignService";
import { getUserSignNowConnections } from "@/lib/signNowService";
import { getUserPandaDocConnections } from "@/lib/pandaDocService";
import { CheckCircle, XCircle, Trash2, Loader2, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DashboardIntegrationsPage() {
  const [activeTab, setActiveTab] = useState("available");
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState({
    docusign: [],
    signnow: [],
    pandadoc: []
  });
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    if (user && activeTab === "connected") {
      loadConnections();
    }
  }, [user, activeTab]);

  const loadConnections = async () => {
    setLoading(true);
    try {
      // Load connections for all providers
      const [docusignResult, signnowResult, pandadocResult] = await Promise.all([
        getUserDocuSignConnections(user.id),
        getUserSignNowConnections(user.id),
        getUserPandaDocConnections(user.id)
      ]);

      setConnections({
        docusign: docusignResult?.connections || [],
        signnow: signnowResult?.connections || [],
        pandadoc: pandadocResult?.connections || []
      });
    } catch (error) {
      console.error("Error loading connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (provider, connectionId) => {
    setDeleteLoading(connectionId);
    try {
      let success = false;
      
      switch (provider) {
        case 'docusign':
          // Import and call the delete function for DocuSign if available
          try {
            const { deleteDocuSignConnection } = await import('@/lib/docusignService');
            const result = await deleteDocuSignConnection(connectionId, user.id);
            success = result?.success || false;
          } catch (error) {
            console.error('Error importing deleteDocuSignConnection:', error);
          }
          break;
        case 'signnow':
          // Import and call the delete function for SignNow if available
          try {
            const { deleteSignNowConnection } = await import('@/lib/signNowService');
            const result = await deleteSignNowConnection(connectionId, user.id);
            success = result?.success || false;
          } catch (error) {
            console.error('Error importing deleteSignNowConnection:', error);
          }
          break;
        case 'pandadoc':
          // Import and call the delete function for PandaDoc
          try {
            const { deletePandaDocConnection } = await import('@/lib/pandaDocService');
            const result = await deletePandaDocConnection(connectionId, user.id);
            success = result?.success || false;
          } catch (error) {
            console.error('Error importing deletePandaDocConnection:', error);
          }
          break;
      }
      
      if (success) {
        await loadConnections();
      }
    } catch (error) {
      console.error(`Error deleting ${provider} connection:`, error);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Check if a provider has any connections
  const hasConnections = (provider) => {
    return connections[provider] && connections[provider].length > 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your eSignature platforms to automatically vault signed documents.
        </p>
      </div>

      <Tabs defaultValue="available" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="available">Available Integrations</TabsTrigger>
          <TabsTrigger value="connected">Connected Platforms</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DocuSign Card */}
            <Card className="border rounded-2xl bg-white shadow-sm hover:shadow-md transition hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                      <span className="font-semibold text-yellow-600 text-xs">D</span>
                    </div>
                    <CardTitle className="text-lg">DocuSign</CardTitle>
                  </div>
                  {hasConnections('docusign') ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Connected</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Not Connected</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="text-sm text-gray-600 mb-4 space-y-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Vault signed documents automatically</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Track and audit signing events</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Blockchain anchoring built-in</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/integrations/docusign" className="w-full">
                  <Button className="w-full">
                    {hasConnections('docusign') ? 'Manage Connection' : 'Connect Account'}
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* SignNow Card */}
            <Card className="border rounded-2xl bg-white shadow-sm hover:shadow-md transition hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                      <span className="font-semibold text-green-600 text-xs">S</span>
                    </div>
                    <CardTitle className="text-lg">SignNow</CardTitle>
                  </div>
                  {hasConnections('signnow') ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Connected</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Not Connected</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="text-sm text-gray-600 mb-4 space-y-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Seamless integration with SignNow</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Automatic document vaulting</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Complete security and compliance</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/integrations/signnow" className="w-full">
                  <Button className="w-full">
                    {hasConnections('signnow') ? 'Manage Connection' : 'Connect Account'}
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* PandaDoc Card */}
            <Card className="border rounded-2xl bg-white shadow-sm hover:shadow-md transition hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                      <span className="font-semibold text-blue-600 text-xs">P</span>
                    </div>
                    <CardTitle className="text-lg">PandaDoc</CardTitle>
                  </div>
                  {hasConnections('pandadoc') ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Connected</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Not Connected</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="text-sm text-gray-600 mb-4 space-y-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Capture finalized PandaDoc documents</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Ensure every contract is safe and auditable</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Automatic webhook integration</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/integrations/pandadoc" className="w-full">
                  <Button className="w-full">
                    {hasConnections('pandadoc') ? 'Manage Connection' : 'Connect Account'}
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* API Integration Card */}
            <Card className="border rounded-2xl bg-white shadow-sm hover:shadow-md transition hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
                      <span className="font-semibold text-purple-600 text-xs">API</span>
                    </div>
                    <CardTitle className="text-lg">Custom API Integration</CardTitle>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Developer</span>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="text-sm text-gray-600 mb-4 space-y-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Integrate directly with our API</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Generate secure API keys</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Programmatically vault documents</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/integrations/api" className="w-full">
                  <Button className="w-full">Manage API Keys</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Adobe Sign Card (Coming Soon) */}
            <Card className="border rounded-2xl bg-white shadow-sm opacity-60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                      <span className="font-semibold text-red-600 text-xs">A</span>
                    </div>
                    <CardTitle className="text-lg">Adobe Sign</CardTitle>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Coming Soon</span>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="text-sm text-gray-600 mb-4 space-y-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                    <span>Instantly vault completed agreements</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                    <span>Full audit tracking</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                    <span>Secure storage with blockchain anchoring</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled>Coming Soon</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="connected">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* DocuSign Connections */}
              {connections.docusign.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">DocuSign Connections</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {connections.docusign.map((connection) => (
                      <Card key={connection.id} className="border rounded-xl">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                                <span className="font-semibold text-yellow-600 text-xs">D</span>
                              </div>
                              <CardTitle className="text-lg">{connection.name || connection.email}</CardTitle>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete('docusign', connection.id)}
                              disabled={deleteLoading === connection.id}
                            >
                              {deleteLoading === connection.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="ml-2">Disconnect</span>
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm">
                            <p className="text-muted-foreground">
                              Connected on {new Date(connection.created_at).toLocaleDateString()}
                            </p>
                            <p className="font-medium mt-1">{connection.email}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* SignNow Connections */}
              {connections.signnow.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">SignNow Connections</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {connections.signnow.map((connection) => (
                      <Card key={connection.id} className="border rounded-xl">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                                <span className="font-semibold text-green-600 text-xs">S</span>
                              </div>
                              <CardTitle className="text-lg">{connection.name || connection.email}</CardTitle>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete('signnow', connection.id)}
                              disabled={deleteLoading === connection.id}
                            >
                              {deleteLoading === connection.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="ml-2">Disconnect</span>
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm">
                            <p className="text-muted-foreground">
                              Connected on {new Date(connection.created_at).toLocaleDateString()}
                            </p>
                            <p className="font-medium mt-1">{connection.email}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* PandaDoc Connections */}
              {connections.pandadoc.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">PandaDoc Connections</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {connections.pandadoc.map((connection) => (
                      <Card key={connection.id} className="border rounded-xl">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                <span className="font-semibold text-blue-600 text-xs">P</span>
                              </div>
                              <CardTitle className="text-lg">{connection.name || connection.email}</CardTitle>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete('pandadoc', connection.id)}
                              disabled={deleteLoading === connection.id}
                            >
                              {deleteLoading === connection.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="ml-2">Disconnect</span>
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm">
                            <p className="text-muted-foreground">
                              Connected on {new Date(connection.created_at).toLocaleDateString()}
                            </p>
                            <p className="font-medium mt-1">{connection.email}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* No connections message */}
              {!connections.docusign.length && !connections.signnow.length && !connections.pandadoc.length && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">
                      No connected platforms yet. Connect an integration from the "Available Integrations" tab to get started.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>
                Configure global settings for your integrations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                These settings apply to all your connected platforms.
              </p>
              
              <div className="space-y-4">
                <div className="border p-4 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Auto-Vaulting</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-80">
                            When enabled, documents will be automatically vaulted when they are signed.
                            This includes blockchain anchoring and tamper-proof storage.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    When enabled, documents will be automatically vaulted when they are signed.
                    This feature is currently in development.
                  </p>
                </div>
                
                <div className="border p-4 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Webhook Notifications</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-80">
                            Configure webhook URLs to receive notifications when documents are vaulted.
                            This allows you to integrate with your own systems.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configure webhook URLs to receive notifications when documents are vaulted.
                    This feature is currently in development.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
